import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { groupId, memberId } = body;

    // Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const groupExists = await db.sismember("groups" , groupId);
    if (!groupExists) {
      return new Response("Group not found", { status: 404 });
    }
    
    // Now, fetch the detailed group information (e.g., creatorId, name, etc.)
    const groupRaw = (await fetchRedis("get", `group:${groupId}`)) as string;
    const group = JSON.parse(groupRaw) as Group;

    if (!group || Object.keys(group).length === 0) {
      return new Response("Group not found", { status: 404 });
    }

    console.log("Group:", group); // Debugging group information

    // Check if the user is the group creator
    const isCreator = group.creatorId === userId;
    if (!isCreator) {
      return new Response(
        "Only the group creator can remove members from the group",
        { status: 403 }
      );
    }

    // Check if the member to be removed is in the group
    const isTargetMember = await db.sismember(
      `group:${groupId}:members`,
      memberId
    );
    if (!isTargetMember) {
      return new Response("The specified member is not part of this group", {
        status: 404,
      });
    }

    // Prevent the creator from being removed
    if (group.creatorId === memberId) {
      return new Response("The group creator cannot be removed", {
        status: 403,
      });
    }

    // Remove the member from the group
    await db.srem(`group:${groupId}:members`, memberId);
    await db.srem(`user:${memberId}:groups`, groupId);

    // Notify group members of the removal via Pusher
    console.log("Triggering Pusher notification...");
    await pusherServer.trigger(
      toPusherKey(`group:${groupId}:members`),
      "member_removed",
      { groupId, memberId }
    );

    console.log(`Member ${memberId} removed from group ${groupId}`);

    return new Response("Member removed successfully", { status: 200 });
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

    console.error("Error removing member from group:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
