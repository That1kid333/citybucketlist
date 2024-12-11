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
  }),
  registration: z.object({
    expirationDate: z.string(),
    documentUrl: z.string().url()
  })
});

export const driverSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  photo: z.string().url("Profile photo must be a valid URL"),
  location: z.string().optional(),
  driversLicense: z.object({
    number: z.string(),
    expirationDate: z.string(),
    documentUrl: z.string().url()
  }),
  vehicle: vehicleSchema,
  backgroundCheck: z.object({
    status: z.enum(["pending", "approved", "rejected"]),
    submissionDate: z.string(),
    documentUrl: z.string().url().optional()
  }),
  subscription: z.object({
    status: z.enum(["trial", "active", "inactive", "cancelled"]),
    plan: z.enum(["elite"]),
    startDate: z.string(),
    trialEndDate: z.string().optional(),
    nextBillingDate: z.string()
  }).optional(),
  available: z.boolean(),
  rating: z.number().min(0).max(5),
  baseRate: z.number().optional(),
  airportRate: z.number().optional(),
  longDistanceRate: z.number().optional(),
  metrics: z.object({
    acceptanceRate: z.number(),
    responseTime: z.number(),
    hoursOnline: z.number(),
    totalRides: z.number(),
    totalEarnings: z.number(),
    todayRides: z.number().optional()
  }),
  created_at: z.string(),
  updated_at: z.string()
});

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  locationId: string;
  isActive: boolean;
  available: boolean;
  rating?: number;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate: string;
  };
  metrics?: {
    totalRides: number;
    yearsActive: number;
    completionRate: number;
    averageResponseTime: number;
  };
  totalRides?: number;
  hoursOnline?: number;
  todayRides?: number;
  acceptanceRate?: number;
  responseTime?: number;
  lastShiftEnd?: string;
  schedule?: Array<{
    day: string;
    hours: string;
  }>;
  recentActivity?: Array<{
    action: string;
    time: string;
  }>;
  created_at: string;
  updated_at: string;
}

export const initialDriver: Driver = {
  id: "",
  name: "",
  email: "",
  phone: "",
  photoURL: "",
  locationId: "",
  isActive: true,
  available: false,
  rating: 5.0,
  totalRides: 0,
  hoursOnline: 0,
  todayRides: 0,
  acceptanceRate: 100,
  responseTime: 0,
  vehicle: {
    make: "",
    model: "",
    year: 2020,
    color: "",
    plate: ""
  },
  metrics: {
    totalRides: 0,
    yearsActive: 0,
    completionRate: 100,
    averageResponseTime: 0
  },
  schedule: [],
  recentActivity: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};