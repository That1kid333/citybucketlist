export interface RideRequest {
  name: string;
  phone: string;
  pickup?: string;
  dropoff?: string;
  locationId: string;
}

export interface Ride extends RideRequest {
  id: string;
  riderId: string;
  driverId?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
  scheduled_time: string;
  updated_at?: string;
}