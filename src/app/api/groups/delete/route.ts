import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Validator for deleting a group
const deleteGroupValidator = z.object({
  groupId: z.string().nonempty("Group ID is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body
    const { groupId } = deleteGroupValidator.parse(body);

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

    // Ensure only the creator can delete the group
    if (group.creatorId !== userId) {
      return new Response("Only the group creator can delete this group", {
        status: 403,
      });
    }

    // Retrieve all members of the group
    const members = await db.smembers(`group:${groupId}:members`);

    // Remove the group from each member's list of groups
    for (const memberId of members) {
      await db.srem(`user:${memberId}:groups`, groupId);
    }

    // Delete all group-related data
    await db.del(`group:${groupId}`); // Group metadata
    await db.del(`group:${groupId}:members`); // Group members
    await db.srem("groups", groupId); // Remove from global groups set

    // Notify all members of group deletion via Pusher (optional)
    for (const memberId of members) {
      await pusherServer.trigger(
        toPusherKey(`user:${memberId}:groups`),
        "group_deleted",
        { groupId }
      );
    }

    console.log(`Group ${groupId} deleted by creator ${userId}`);

    return new Response("Group deleted successfully", { status: 200 });
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

    console.error("Error deleting group:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
