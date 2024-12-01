import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string().max(500), // 500 characters max
  timestamp: z.number(),
});

export const messageArraySchema = z.array(messageSchema);

export type Message = z.infer<typeof messageSchema>;