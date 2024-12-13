import { z } from 'zod';

export interface Rider {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  premium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const riderSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email'),
  location: z.string(),
  premium: z.boolean()
});

export type RiderFormData = z.infer<typeof riderSchema>;
