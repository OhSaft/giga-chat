import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Updated validator to match the frontend request
const addMemberValidator = z.object({
  friendId: z.string().nonempty("Friend ID is required"),
  groupId: z.string().nonempty("Group ID is required")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body
    const { friendId, groupId } = addMemberValidator.parse(body);

    console.log(friendId, groupId);

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Check if the group exists
    const group = await fetchRedis("get", `group:${groupId}`);
    console.log(group)
    if (!group || Object.keys(group).length === 0) {
      return new Response("Group not found", { status: 404 });
    }

    // Check if the user is the group creator or a member
    const isCreator = group.creatorId === userId;
    const isMember = await db.sismember(`group:${groupId}:members`, userId);

    if (!isCreator && !isMember) {
      return new Response(
        "You are not authorized to add members to this group",
        { status: 403 }
      );
    }

    // Check the current number of members in the group
    const currentMembers = await db.scard(`group:${groupId}:members`);
    const remainingSlots = 10 - currentMembers;

    if (currentMembers >= 10) {
      return new Response("This group already has the maximum of 10 members", {
        status: 403,
      });
    }

    // Add the new member to the group
    await db.sadd(`group:${groupId}:members`, friendId);
    await db.sadd(`user:${friendId}:groups`, groupId);

    // Notify group members of the addition via Pusher
    await pusherServer.trigger(
      toPusherKey(`group:${groupId}:members`),
      "members_added",
      { groupId, members: [friendId] }
    );

    console.log(`Member ${friendId} added to group ${groupId}`);

    return new Response("Member added successfully", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      const errorMessages = zodError.errors
        .map((err) => err.message)
        .join("; ");
      return new Response(`Invalid request payload: ${errorMessages}`, {
        status: 422,
      });
    }

    console.error("Error adding member to group:", error);
    return new Response("Internal server error", { status: 500 });
  }
}