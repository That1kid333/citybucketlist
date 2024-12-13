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
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  isOnline: boolean;
  rating?: number;
  totalRides?: number;
  completedRides?: number;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const initialDriver: Partial<Driver> = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  location: "",
  isOnline: false,
  rating: 5.0,
  vehicle: {
    make: "",
    model: "",
    year: 0,
    color: "",
    licensePlate: ""
  },
  createdAt: new Date(),
  updatedAt: new Date()
};