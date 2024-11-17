import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Validator for group creation
const createGroupValidator = z.object({
  name: z
    .string()
    .min(5, "Group name is required and must be at least 5 characters")
    .max(30),
  description: z
    .string()
    .max(100, "Description too long (max 100 characters)")
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, description } = createGroupValidator.parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const userGroups = (await db.smembers(`user:${userId}:groups`)) as string[];
    // only own created groups should be max of 3
    let count = 0;

    for (const userGroup of userGroups) {
      const groupRaw = (await fetchRedis(
        "get",
        `group:${userGroup}`
      )) as string;
      const group = JSON.parse(groupRaw) as Group;
      if (group.creatorId === userId) {
        count++;
      }
    }
    if (count >= 3) {
      return new Response("You cannot create more than 3 groups for now.", {
        status: 403,
      });
    }

    const groupId = nanoid();
    const timestamp = Date.now();

    // Create group as JSON string
    const groupData = JSON.stringify({
      id: groupId,
      name: name,
      description: description || "",
      createdAt: timestamp,
      creatorId: session.user.id,
      members: [session.user.id],
    });

    // Store group as JSON string
    await db.set(`group:${groupId}`, groupData);

    // Add group to global groups set
    await db.sadd("groups", groupId);

    // Add creator to group members
    await db.sadd(`group:${groupId}:members`, session.user.id);

    // Add group to creator's groups
    await db.sadd(`user:${session.user.id}:groups`, groupId);

    await pusherServer.trigger(
      toPusherKey(`user:${session.user.id}:groups`),
      "group_created",
      {
        groupId,
        name,
        description,
        createdAt: timestamp,
      }
    );

    console.log(`Group created: ${groupId}`);

    return new Response("Group created successfully", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      return new Response(zodError.errors[0].message, { status: 422 });
    }

    console.error("Group creation error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
