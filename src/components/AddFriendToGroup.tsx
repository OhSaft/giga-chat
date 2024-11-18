"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
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
  availableFriends: User[];
}

const AddFriendToGroup: FC<AddFriendToGroupProps> = ({ groupId, availableFriends }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const addMemberToGroup = async (friendId: string) => {
    setIsLoading(friendId);
    try {
      const response = await fetch(`/api/groups/add`, {
        method: 'POST',
        body: JSON.stringify({ friendId, groupId }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        router.refresh();
      } else {
        // Handle error
        console.error('Failed to add member');
        console.error(await response.text());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(null);
    }
  };

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
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>
              </div>

              <button
                onClick={() => addMemberToGroup(friend.id)}
                disabled={isLoading === friend.id}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                {isLoading === friend.id ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <UserPlus className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddFriendToGroup;