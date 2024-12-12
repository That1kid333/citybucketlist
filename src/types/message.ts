import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  content: z.string(),
  senderId: z.string(),
  senderType: z.enum(['rider', 'driver']),
  timestamp: z.string(),
});

export const chatSchema = z.object({
  id: z.string(),
  riderId: z.string(),
  riderName: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  lastMessage: z.string().optional(),
  lastMessageTime: z.string().optional(),
  unreadCount: z.number().default(0),
});

export type Message = z.infer<typeof messageSchema>;
export type Chat = z.infer<typeof chatSchema>;
