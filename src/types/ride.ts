export interface RideRequest {
  name: string;
  phone: string;
  pickup?: string;
  dropoff?: string;
  locationId: string;
}

export interface Ride {
  id?: string;
  riderId: string | null;
  driverId?: string;
  driverName?: string;
  scheduledTime: string;
  pickup?: string;
  dropoff?: string;
  passengers?: number;
  notes?: string;
  status: 'pending' | 'scheduled' | 'assigned' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}