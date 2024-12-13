export interface RideTransfer {
  id: string;
  rideId: string;
  originalDriverId: string;
  newDriverId: string;
  transferFee: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface RideTransferRequest {
  rideId: string;
  originalDriverId: string;
  newDriverId: string;
  transferFee: number;
}
