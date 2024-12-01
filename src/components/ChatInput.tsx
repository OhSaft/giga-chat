"use client";

import { FC, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { z } from "zod";

interface ChatInputProps {
  chatPartner: User;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const maxCharacters = 500;

  const sendMessage = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    try {
      await axios.post("/api/message/send", { text: input, chatId: chatId });
      setInput("");
      textareaRef.current?.focus();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Failed to send message111");
        return;
      }
      if (error instanceof AxiosError) {
        toast.error("Message is too long\n(max 500 characters)");
        return;
      }
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const currentLetterCount = input.length;

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600 parent-focus-within">
        {" "}
        {/* Added custom class */}
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6 max-h-36 overflow-y-auto scrollbar-thumb-rounded scrollbar-w-2 scrolling-touch 
        scrollbar-thumb-darker 
        parent-focus-scrollbar-thumb-lighter"
        />
        <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-14" />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 flex items-center justify-between py-2 pl-3 pr-2">
          <div className="flex text-gray-500 text-sm mr-2">
            {currentLetterCount} / {maxCharacters}
          </div>
          <div className="flex-shrink-0">
            <Button isLoading={isLoading} onClick={sendMessage} type="submit">
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
