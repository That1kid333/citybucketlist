import { z } from 'zod';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  notes?: string;
  driverId: string;
  createdAt: string;
  updatedAt: string;
  rideHistory?: {
    date: string;
    pickup: string;
    dropoff: string;
    fare?: number;
  }[];
}

export const riderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email'),
  pickupAddress: z.string().optional(),
  dropoffAddress: z.string().optional(),
  notes: z.string().optional()
});

export type RiderFormData = z.infer<typeof riderSchema>;
