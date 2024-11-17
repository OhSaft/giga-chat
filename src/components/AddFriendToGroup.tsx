"use server";

import { FC } from "react";
import { fetchRedis } from "@/helpers/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserPlus } from "lucide-react";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  name: string;
  image: string;
}

interface AddFriendToGroupProps {
  groupId: string;
}

const AddFriendToGroup: FC<AddFriendToGroupProps> = async ({ groupId }) => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Get user's friends
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:friends`
  )) as string[];

  // Get current group members to filter out
  const groupMembersRaw = (await fetchRedis(
    "smembers",
    `group:${groupId}:members`
  )) as string[];

  // Get full friend objects
  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:${friendId}`)) as string;
      return JSON.parse(friend) as User;
    })
  );

  // Filter out friends who are already in the group
  const availableFriends = friends.filter(
    (friend) => !groupMembersRaw.includes(friend.id)
  );

  return (
    <div className="px-4">
      {availableFriends.length === 0 ? (
        <p className="text-sm text-gray-500">
          No friends available to add to this group.
        </p>
      ) : (
        <div className="grid gap-4">
          {availableFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={friend.image || "/placeholder-avatar.jpg"}
                  alt={`${friend.name}'s profile picture`}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>
              </div>

              <form
                className="flex items-center gap-2"
              >
                <button
                  type="submit"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <UserPlus className="w-5 h-5 text-gray-600" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddFriendToGroup;
