import CreateGroupButton from '@/components/CreateGroup';
import { FC } from 'react';

const page: FC = () => {
  return (
  <main className='pt-8'>
    <h1 className='font-bold text-5x1 mb-8'>Create a group</h1>
    <CreateGroupButton />
  </main>);
};

export default page;