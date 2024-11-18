"use client";

import { Message } from "@/lib/message";
import { cn, toPusherKey } from "@/lib/utils";
import { FC, useEffect, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  groupId: string;
  sessionImage: string | null | undefined;
  groupUsers: User[]; // Array of group members
}

const GroupMessages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  groupId,
  sessionImage,
  groupUsers,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`group:${groupId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming_message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`group:${groupId}`));
      pusherClient.unbind("incoming_message", messageHandler);
    };
  }, [groupId]);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimeStamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  const getUserById = (userId: string) =>
    groupUsers.find((user) => user.id === userId);

  const formatDate = (timestamp: number) => {
    return format(timestamp, "MMMM dd, yyyy");
  };

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const sender = getUserById(message.senderId);

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        const hasLastMessageFromSameUser =
          messages[index + 1]?.senderId === messages[index].senderId;

        const isNewDay =
          index === messages.length - 1 ||
          !isSameDay(messages[index + 1]?.timestamp, messages[index].timestamp);

        return (
          <div
            className="chat-message"
            key={`${message.id}-${message.timestamp}`}
          >
            {isNewDay && (
              <div className="text-center text-gray-500 my-2">
                <span className="px-4 py-1 bg-gray-200 rounded-lg text-sm">
                  {formatDate(message.timestamp)}
                </span>
              </div>
            )}
            <div
              className={cn("flex items-end", { "justify-end": isCurrentUser })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                {!isCurrentUser && sender && !hasLastMessageFromSameUser && (
                  <span className="text-sm text-gray-500">{sender.name}</span>
                )}
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimeStamp(message.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser
                      ? (sessionImage as string)
                      : sender?.image || "/placeholder-image.png"
                  }
                  alt="Profile Picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupMessages;
