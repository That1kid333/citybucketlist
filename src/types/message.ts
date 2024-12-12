import { z } from 'zod';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: 'driver' | 'rider';
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  driverId: string;
  riderId: string;
  driverName: string;
  riderName: string;
  driverPhoto?: string;
  riderPhoto?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  senderId: z.string(),
  senderName: z.string(),
  senderType: z.enum(['driver', 'rider']),
  timestamp: z.string(),
  read: z.boolean(),
});

export const chatSchema = z.object({
  driverId: z.string(),
  riderId: z.string(),
  driverName: z.string(),
  riderName: z.string(),
  driverPhoto: z.string().optional(),
  riderPhoto: z.string().optional(),
  lastMessage: z.string(),
  lastMessageTime: z.string(),
  unreadCount: z.number(),
  messages: z.array(messageSchema),
});
