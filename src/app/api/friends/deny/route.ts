import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await getServerSession(authOptions);

    // check if user is logged in
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id: idToDeny } = z.object({ id: z.string() }).parse(body);

    // remove friend request
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);

    // Trigger Pusher event for real-time update
    await pusherServer.trigger(
      toPusherKey(`user:${session.user.id}:incoming_friend_requests`),
      "friend_request_denied",
      { deniedId: idToDeny }
    );

    return new Response("Friend request removed", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
