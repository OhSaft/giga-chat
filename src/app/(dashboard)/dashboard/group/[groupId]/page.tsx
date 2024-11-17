import GroupHeader from "@/components/GroupHeader";
import GroupInput from "@/components/GroupInput";
import GroupMessages from "@/components/GroupMessages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArraySchema } from "@/lib/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    groupId: string;
  };
}

type Params = Promise<{ groupId: string }>;

async function getGroupMessages(groupId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `group:${groupId}:messages`,
      0,
      -1
    );

    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedMessages = dbMessages.reverse();

    const messages = messageArraySchema.parse(reversedMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const Page = async ({ params }: { params: Params }) => {
  const resolvedParams = await params;
  const { groupId } = resolvedParams;

  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const { user } = session;

  const userId = user.id;

  const groupUsersRaw = (await fetchRedis(
    "smembers",
    `group:${groupId}:members`
  )) as string[];

  // parse them into User objects
  const groupUsers = await Promise.all(
    groupUsersRaw.map(async (userId) => {
      const userRaw = (await fetchRedis("get", `user:${userId}`)) as string;
      return JSON.parse(userRaw) as User;
    })
  );

  // Check if user is part of the group
  if (!groupUsers.find((user) => user.id === userId)) {
    notFound();
  }

  const groupRaw = (await fetchRedis("get", `group:${groupId}`)) as string;
  const group = JSON.parse(groupRaw) as Group;

  const initialMessages = await getGroupMessages(groupId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <GroupHeader 
        group={group}
        groupUsers={groupUsers}
        groupId={groupId}
      />
      <GroupMessages
        sessionId={session.user.id}
        initialMessages={initialMessages}
        groupUsers={groupUsers}
        sessionImage={session.user.image}
        groupId={groupId}
      />
      <GroupInput groupId={groupId} />
    </div>
  );
};

export default Page;
