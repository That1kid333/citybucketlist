import { z } from 'zod';

export const vehicleSchema = z.object({
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  year: z.string().regex(/^\d{4}$/, "Must be a valid year"),
  color: z.string().min(1, "Vehicle color is required"),
  plate: z.string().min(1, "License plate is required"),
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    expirationDate: z.string(),
    documentUrl: z.string().url()
  }).optional(),
  registration: z.object({
    expirationDate: z.string(),
    documentUrl: z.string().url()
  }).optional()
});

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  locationId?: string;
  available?: boolean;
  rating?: number;
  totalRides?: number;
  joinDate?: string;
  tagNumber?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
  updated_at?: string;
  created_at?: string;
}

export const initialDriver: Partial<Driver> = {
  id: "",
  name: "",
  email: "",
  phone: "",
  photoURL: "",
  locationId: "",
  available: false,
  rating: 5.0,
  vehicle: {
    make: "",
    model: "",
    year: 0,
    color: ""
  },
  updated_at: "",
  created_at: ""
};