import { z } from 'zod';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  favoriteDrivers?: string[]; // Array of driver IDs
  rideHistory?: {
    id: string;
    date: string;
    pickup: string;
    dropoff: string;
    driverId: string;
    driverName: string;
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    fare?: number;
  }[];
}

export const riderSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email'),
  created_at: z.string(),
  updated_at: z.string(),
  favoriteDrivers: z.array(z.string()).optional(),
  rideHistory: z.array(z.object({
    id: z.string(),
    date: z.string(),
    pickup: z.string(),
    dropoff: z.string(),
    driverId: z.string(),
    driverName: z.string(),
    status: z.enum(['pending', 'accepted', 'completed', 'cancelled']),
    fare: z.number().optional()
  })).optional()
});

export type RiderFormData = z.infer<typeof riderSchema>;
