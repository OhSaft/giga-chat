import { FC } from 'react';
import AddFriendToGroup from '@/components/AddFriendToGroup';
import { fetchRedis } from '@/helpers/redis';

interface PageProps {
  params: {
    groupId: string;
  }
}

const Page: FC<PageProps> = async ({ params }) => {

    const groupId = params.groupId;
    const groupRaw = await fetchRedis('get', `group:${groupId}`) as string;
    const group = JSON.parse(groupRaw) as Group;
  return (
    <main className='pt-8'>
      <h1 className='font-bold text-5xl mb-8'>Add friends to {group.name}</h1>
      <AddFriendToGroup groupId={params.groupId} />
    </main>
  );
};

export default Page;