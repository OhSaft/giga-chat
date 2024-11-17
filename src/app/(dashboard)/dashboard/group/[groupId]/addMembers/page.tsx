import { FC } from "react";
import AddFriendToGroup from "@/components/AddFriendToGroup";
import { fetchRedis } from "@/helpers/redis";

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
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add friends to {group.name}</h1>
      <AddFriendToGroup groupId={groupId} />
    </main>
  );
};

export default Page;
