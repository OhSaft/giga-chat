import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageSchema } from "@/lib/message";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const { text, groupId }: { text: string; groupId: string } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const groupUsersRaw = (await fetchRedis("smembers", `group:${groupId}:members`)) as string[];

    if (!groupUsersRaw.includes(session.user.id)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawSender = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(rawSender) as User;

    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = messageSchema.parse(messageData);

    // notify all connected chat room clients
    await pusherServer.trigger(
      toPusherKey(`group:${groupId}`),
      "incoming_message",
      {
        ...message,
        senderImg: sender.image,
        senderName: sender.name,
      }
    );
/*
    await pusherServer.trigger(
      toPusherKey(`user:${friendId}:chats`),
      "new_message",
      {
        ...message,
        senderImg: sender.image,
        senderName: sender.name,
      }
    );*/

    // all valid, send the message
    await db.zadd(`group:${groupId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
