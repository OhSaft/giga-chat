"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import { UserPlus, Users, UserMinus } from "lucide-react";
import Image from "next/image";

interface GroupHeaderProps {
  group: Group;
  groupUsers: User[];
  groupId: string;
  userId: string;
}

const GroupHeader: FC<GroupHeaderProps> = ({
  group,
  groupUsers,
  groupId,
  userId,
}) => {
  const [showMembers, setShowMembers] = useState(false);

  return (
    <div className="flex-col">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {group.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">{group.description}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-md text-gray-600 flex items-center"
            onClick={() => setShowMembers(!showMembers)}
          >
            <Users className="h-4 w-4 mr-1" />
            <span>{groupUsers.length} / 10</span>
          </button>

          <Link href={`/dashboard/group/${groupId}/addMembers`}>
            <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
              <UserPlus className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      {showMembers && (
        <div className="border-b-2 border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Group Members</h3>
          <div className="space-y-3">
            {groupUsers.map((groupUser) => (
              <div key={groupUser.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image
                    src={groupUser.image || "/placeholder-avatar.jpg"}
                    alt={`${groupUser.name}'s avatar`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span>{groupUser.name}</span>
                </div>
                {groupUser.id === group.creatorId ? (
                  <span className="ml-2 text-xs text-gray-700 italic">
                    Group owner
                  </span>
                ) : (
                  userId === group.creatorId &&
                  groupUser.id !== group.creatorId && (
                    <Link
                      href={`/group/${groupId}/removeMembers?userId=${groupUser.id}`}
                    >
                      <button className="p-2 hover:bg-gray-100 rounded-md text-red-600">
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupHeader;
