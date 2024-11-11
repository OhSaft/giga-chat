import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string().max(2000), // max length of 2000 characters
  timestamp: z.number(),
});

export const messageArraySchema = z.array(messageSchema);

export type Message = z.infer<typeof messageSchema>;