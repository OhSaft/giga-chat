interface User {
  name: string; // name
  email: string; // email
  image: string; // url
  id: string; // unique id
  groups: string[]; // array of group ids
}

interface Chat {
  id: string; // unique id
  messages: Message[]; // array of messages
}

interface Message {
  id: string; // unique id
  senderId: string; // user id
  text: string; // max length of 2000 characters
  timestamp: number; // timestamp
}

interface FriendRequest {
  id: string; // unique id
  senderId: string; // user id
  receiverId: string; // user id
}
interface Group {
  id: string; // unique id
  name: string; // group name
  description?: string; // optional
  createdAt: number; // timestamp
  creatorId: string; // user id
  members: string[]; // user ids
}
