import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Validator for leaving a group
const leaveGroupValidator = z.object({
  groupId: z.string().nonempty("Group ID is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body
    const { groupId } = leaveGroupValidator.parse(body);

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

    // Check if the user is a member of the group
    const isMember = await db.sismember(`group:${groupId}:members`, userId);

    if (!isMember) {
      return new Response("You are not a member of this group", {
        status: 403,
      });
    }

    // Prevent the creator from leaving unless the group is deleted or ownership is transferred
    if (group.creatorId === userId) {
      return new Response(
        "The group creator cannot leave the group. Transfer ownership or delete the group instead.",
        { status: 403 }
      );
    }

    // Remove the user from the group
    await db.srem(`group:${groupId}:members`, userId);
    await db.srem(`user:${userId}:groups`, groupId);

    // Notify group members of the user's departure via Pusher (optional)
    await pusherServer.trigger(
      toPusherKey(`group:${groupId}:members`),
      "member_left",
      { groupId, memberId: userId }
    );

    console.log(`User ${userId} left group ${groupId}`);

    return new Response("You have left the group successfully", {
      status: 200,
    });
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

    console.error("Error leaving group:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
