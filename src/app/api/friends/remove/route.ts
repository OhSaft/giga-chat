import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function DELETE(req: Request) {
  try {
    // Get the JSON body of the request
    const body = await req.json();
    const { friendId } = body;

    // Get the current session of the authenticated user
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Ensure the friendId is valid
    if (!friendId || userId === friendId) {
      return new Response("Invalid request.", { status: 400 });
    }

    // Check if the user is friends with the provided friendId
    const isFriend = await fetchRedis(
      "sismember",
      `user:${userId}:friends`,
      friendId
    );

    if (!isFriend) {
      return new Response("Not friends with this user.", { status: 400 });
    }

    // Remove the friend from both users' friend lists
    await db.srem(`user:${userId}:friends`, friendId);
    await db.srem(`user:${friendId}:friends`, userId);

    // Return success response
    return new Response("Friend removed successfully.", { status: 200 });
  } catch (error) {
    console.error("Error removing friend:", error);
    return new Response("Failed to remove friend.", { status: 500 });
  }
}
