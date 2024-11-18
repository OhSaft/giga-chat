import { FC } from "react";
import AddFriendToGroup from "@/components/AddFriendToGroup";
import { fetchRedis } from "@/helpers/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
  params: {
    groupId: string;
  };
}

type Params = Promise<{ groupId: string }>;

const Page = async ({ params }: { params: Params }) => {
  const resolvedParams = await params;
  const { groupId } = resolvedParams;
  const groupRaw = (await fetchRedis("get", `group:${groupId}`)) as string;
  const group = JSON.parse(groupRaw) as Group;

  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Get user's friends
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:friends`
  )) as string[];

  // filter all friends that are not already in the group by using friendIds and group.members
  const availableFriends: User[] = [];
  for (const friendId of friendIds) {
    if (!group.members.includes(friendId)) {
      const userRaw = (await fetchRedis("get", `user:${friendId}`)) as string;
      availableFriends.push(JSON.parse(userRaw) as User);
    }
  }

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add friends to {group.name}</h1>
      <AddFriendToGroup groupId={groupId} availableFriends={availableFriends} />
    </main>
  );
};

export default Page;
