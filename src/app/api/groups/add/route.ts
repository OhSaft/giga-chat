import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Validator for adding members
const addMembersValidator = z.object({
  groupId: z.string().nonempty("Group ID is required"),
  members: z
    .array(z.string().nonempty())
    .min(1, "At least one member ID is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body
    const { groupId, members } = addMembersValidator.parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Check if the group exists
    const group = await db.hgetall(`group:${groupId}`);
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

    if (members.length > remainingSlots) {
      return new Response(
        `You can only add up to ${remainingSlots} more member(s) to this group`,
        { status: 403 }
      );
    }

    // Add the new members to the group
    for (const member of members) {
      await db.sadd(`group:${groupId}:members`, member);
      await db.sadd(`user:${member}:groups`, groupId);
    }

    // Notify group members of the addition via Pusher (optional)
    await pusherServer.trigger(
      toPusherKey(`group:${groupId}:members`),
      "members_added",
      { groupId, members }
    );

    console.log(`Members added to group ${groupId}:`, members);

    return new Response("Members added successfully", { status: 200 });
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

    console.error("Error adding members to group:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
