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
  phone?: string;
  photoURL?: string;
  photo?: string;
  locationId: string;
  isActive: boolean;
  available: boolean;
  rating?: number;
  vehicle?: {
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
    insurance?: {
      provider: string;
      policyNumber: string;
      expirationDate: string;
      documentUrl: string;
    };
    registration?: {
      expirationDate: string;
      documentUrl: string;
    };
  };
  driversLicense?: {
    number: string;
    expirationDate: string;
    documentUrl: string;
  };
  backgroundCheck?: {
    status: "pending" | "approved" | "rejected";
    submissionDate: string;
    documentUrl?: string;
  };
  subscription?: {
    status: "trial" | "active" | "inactive" | "cancelled";
    plan: "elite";
    startDate: string;
    trialEndDate?: string;
    nextBillingDate: string;
  };
  metrics?: {
    totalRides: number;
    yearsActive: number;
    completionRate: number;
    averageResponseTime: number;
  };
  schedule?: Array<{
    day: string;
    hours: string;
  }>;
  recentActivity?: Array<{
    action: string;
    time: string;
  }>;
  // Dashboard specific fields
  totalRides?: number;
  hoursOnline?: number;
  todayRides?: number;
  acceptanceRate?: number;
  responseTime?: number;
  lastShiftEnd?: string;
  created_at: string;
  updated_at: string;
}

export const initialDriver: Partial<Driver> = {
  id: "",
  name: "",
  email: "",
  phone: "",
  photoURL: "",
  photo: "",
  locationId: "",
  isActive: false,
  available: false,
  rating: 5.0,
  vehicle: {
    make: "",
    model: "",
    year: "",
    color: "",
    plate: ""
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};