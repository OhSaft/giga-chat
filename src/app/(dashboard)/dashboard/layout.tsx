import FriendRequestsSidebarOptions from "@/components/FriendRequestsSidebarOptions";
import { Icon, Icons } from "@/components/Icons";
import MobileChatLayout from "@/components/MobileChatLayout";
import SidebarChatList from "@/components/SidebarChatList";
import SidebarGroupList from "@/components/SidebarGroupList";
import SignOutButton from "@/components/SignOutButton";
import {
  getFriendsByUserId,
  getGroupsByUserId,
} from "@/helpers/get-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { SidebarOption } from "@/types/typings";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
  {
    id: 2,
    name: "Create group",
    href: "/dashboard/createGroup",
    Icon: "GroupIcon",
  },
];

const layout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const friends = (await getFriendsByUserId(session.user.id)) as User[];
  const groups = (await getGroupsByUserId(session.user.id)) as Group[];

  const unseenRequestsCount = (
    (await fetchRedis(
      "smembers",
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  return (
    <div className="w-full flex h-screen">
      <div className="md:hidden">
        <MobileChatLayout
          friends={friends}
          session={session}
          sidebarOptions={sidebarOptions}
          unseenRequestCount={unseenRequestsCount}
        />
      </div>
      <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard">
          <div className="w-full flex items-center justify-center mt-8">
            <svg
              className="h-40 w-30 border-indigo-600 border-4 rounded-b-full p-2 ml-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 110.62 173.65"
              fill="#4f46e5"
            >
              <path d="M55.07,67.91v47.02h24.55l6.7,8.06v-10.52l24.3-27.54v42.76c-12.77,6.75-20.4,18.33-22.76,31.4-.28,1.57-.25,6.76-1.05,7.56-19.33,9.26-43.06,9.36-62.42.15C24.27,151.04,16.02,134.68,0,127.47v-42.54l24.8,27.99v10.08l6.2-8.06h13.14v-36.72H15.87v-10.3h39.2ZM45.65,146.72v-11.19h19.84v11.19l14.4-5.67c-.48-2.92.65-7.43-.14-10.12-.53-1.79-4.24-4.87-4.94-6.95l-38.87.32c-.42.28-4.93,6.52-5.07,7.07-.28,1.15-.34,8.23,0,9.22.17.51.49.68.92.96,1.41.9,10.43,4.42,12.35,4.97.51.15.96.29,1.51.21h0Z" />
              <path d="M110.62,69.25c-4.93-5.35-10.32-10.22-16.36-14.55,13.09-10.42,6.55-29.86-10.7-31.84-14.27,15.95-41.31,15.97-56.01.44-12.78,2.61-19.21,15.86-12.92,26.26.73,1.2,3.41,3.84,3.27,4.66l-9.23,6.52L0,69.71V19.33c30.81-25.83,79.39-25.56,110.61-.45v50.38h.01Z" />
              <polygon points="94.75 78.21 66.48 78.21 66.48 67.91 94.01 67.91 94.75 68.58 94.75 78.21" />
            </svg>
          </div>
        </Link>

        {groups.length > 0 ? (
          <div className="text-xs font-semibold leading-6 text-gray-400">
            Your groups
          </div>
        ) : null}

        <nav className="flex flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarGroupList sessionId={session.user.id} groups={groups} />
            </li>
          </ul>
        </nav>

        {friends.length > 0 ? (
          <div className="text-xs font-semibold leading-6 text-gray-400">
            Your friends
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarChatList sessionId={session.user.id} friends={friends} />
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      >
                        <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <FriendRequestsSidebarOptions
                    sessionId={session.user.id}
                    initialUnseenRequestCount={unseenRequestsCount}
                  />
                </li>
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ""}
                    alt="Your profile picture"
                  />
                </div>
                <span className="sr-only">Your profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{session.user.name}</span>
                  <span className="text-xs text-zinc-400" aria-hidden="true">
                    {session.user.email}
                  </span>
                </div>
              </div>
              <SignOutButton className="h-full aspect-square"></SignOutButton>
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-h-screen container py-16 md:py-12 w-full">
        {children}
      </aside>
    </div>
  );
};

export default layout;
