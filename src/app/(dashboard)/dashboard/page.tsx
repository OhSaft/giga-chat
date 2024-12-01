import {
  getFriendsByUserId,
  getGroupsByUserId,
} from "@/helpers/get-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const formatTimeStamp = (timestamp: number) => {
  return format(timestamp, "HH:mm");
};

const formatDate = (timestamp: number) => {
  return format(timestamp, "MMMM dd, yyyy");
};

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];
      if (!lastMessageRaw) {
        return { ...friend, lastMessage: null };
      }
      let lastMessage;
      try {
        lastMessage = JSON.parse(lastMessageRaw) as Message;
      } catch (error) {
        console.error("Failed to parse JSON:", error, lastMessageRaw);
        lastMessage = null;
      }

      return { ...friend, lastMessage };
    })
  );

  const groups = await getGroupsByUserId(session.user.id);

  const groupsWithLastMessage = await Promise.all(
    groups.map(async (group) => {
      const [lastMessageRaw] = (await fetchRedis(
        "zrange",
        `group:${group.id}:messages`,
        -1,
        -1
      )) as string[];
      if (!lastMessageRaw) {
        return { ...group, lastMessage: null };
      }
      let lastMessage;
      try {
        lastMessage = JSON.parse(lastMessageRaw) as Message;
      } catch (error) {
        console.error("Failed to parse JSON:", error, lastMessageRaw);
        lastMessage = null;
      }

      return { ...group, lastMessage };
    })
  );

  // Filter out friends and groups that don't have a lastMessage
  const friendsWithValidLastMessage = friendsWithLastMessage.filter(
    (friend) => friend.lastMessage !== null
  );
  const groupsWithValidLastMessage = groupsWithLastMessage.filter(
    (group) => group.lastMessage !== null
  );

  // Sort friends and groups by the timestamp of the last message in descending order
  const sortedFriends = friendsWithValidLastMessage.sort((a, b) => {
    if (a.lastMessage && b.lastMessage) {
      return b.lastMessage.timestamp - a.lastMessage.timestamp; // Sort by latest timestamp
    }
    return 0;
  });

  const sortedGroups = groupsWithValidLastMessage.sort((a, b) => {
    if (a.lastMessage && b.lastMessage) {
      return b.lastMessage.timestamp - a.lastMessage.timestamp; // Sort by latest timestamp
    }
    return 0;
  });

  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>

      {/* Recent Friends Chats Section */}
      {sortedFriends.length === 0 ? (
        <p className="text-sm text-zinc-500">No chats yet</p>
      ) : (
        <>
          <h2 className="font-semibold text-2xl mb-4">Recent Friends</h2>
          {sortedFriends.map((friend) => (
            <div
              key={friend.id}
              className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md mb-4"
            >
              <div className="absolute right-4 inset-y-0 flex items-center">
                <ChevronRight className="h-7 w-7 text-zinc-400" />
              </div>
              <Link
                href={`/dashboard/chat/${chatHrefConstructor(
                  session.user.id,
                  friend.id
                )}`}
                className="relative sm:flex"
              >
                <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                  <div className="relative h-6 w-6">
                    <Image
                      referrerPolicy="no-referrer"
                      className="rounded-full"
                      alt={`${friend.name} profile picture`}
                      fill
                      src={friend.image}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold">
                    {friend.name}{" "}
                    {friend.lastMessage && (
                      <span className="font-normal text-sm text-zinc-400">
                        {formatTimeStamp(friend.lastMessage.timestamp)}{" "}
                        {formatDate(friend.lastMessage.timestamp)}
                      </span>
                    )}
                  </h4>
                  <p className="mt-1 max-w-md">
                    <span className="text-zinc-400">
                      {friend.lastMessage &&
                      friend.lastMessage.senderId === session.user.id
                        ? "You: "
                        : ""}
                    </span>
                    {friend.lastMessage && friend.lastMessage.text}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </>
      )}

      {/* Recent Group Chats Section */}
      {sortedGroups.length === 0 ? (
        <p className="text-sm text-zinc-500 mt-8">No group chats yet</p>
      ) : (
        <>
          <h2 className="font-semibold text-2xl mb-4 mt-8">Recent Groups</h2>
          {sortedGroups.map((group) => (
            <div
              key={group.id}
              className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md mb-4"
            >
              <div className="absolute right-4 inset-y-0 flex items-center">
                <ChevronRight className="h-7 w-7 text-zinc-400" />
              </div>
              <Link
                href={`/dashboard/group/${group.id}`}
                className="relative sm:flex"
              >
                <div>
                  <h4 className="text-lg font-semibold">
                    {group.name}{" "}
                    {group.lastMessage && (
                      <span className="font-normal text-sm text-zinc-400">
                        {formatTimeStamp(group.lastMessage.timestamp)}{" "}
                        {formatDate(group.lastMessage.timestamp)}
                      </span>
                    )}
                  </h4>
                  <p className="mt-1 max-w-md">
                    <span className="text-zinc-400">
                      {group.lastMessage &&
                      group.lastMessage.senderId === session.user.id
                        ? "You: "
                        : ""}
                    </span>
                    {group.lastMessage && group.lastMessage.text}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default page;
