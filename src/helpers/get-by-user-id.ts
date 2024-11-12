import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = (await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:${friendId}`)) as string;
      const parsedFriend = JSON.parse(friend) as User;
      return parsedFriend;
    })
  )) as User[];

  return friends;
};

export const getGroupsByUserId = async (userId: string) => {
  console.log("userId", userId);
  const groupIds = (await fetchRedis(
    "smembers",
    `user:${userId}:groups`
  )) as string[];

  console.log("groupIds", groupIds);

  const groups = (await Promise.all(
    groupIds.map(async (groupId) => {
      const group = (await fetchRedis("get", `group:${groupId}`)) as string;
      const parsedGroup = JSON.parse(group) as Group;
      return parsedGroup;
    })
  )) as Group[];

  return groups;
};
