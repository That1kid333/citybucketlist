import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';

interface RideRequest {
  id?: string;
  riderId: string;
  driverId: string;
  pickup: string;
  dropoff: string;
  date: Date;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
}

export function useRideRequests() {
  const { user } = useAuth();
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const rideRequestsRef = collection(db, 'rideRequests');
    const q = query(
      rideRequestsRef,
      where(user.role === 'driver' ? 'driverId' : 'riderId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: RideRequest[] = [];
        snapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() } as RideRequest);
        });
        setRideRequests(requests);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createRideRequest = async (request: Omit<RideRequest, 'id' | 'createdAt'>) => {
    try {
      const rideRequestsRef = collection(db, 'rideRequests');
      await addDoc(rideRequestsRef, {
        ...request,
        createdAt: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ride request');
      throw err;
    }
  };

  const updateRideRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const requestRef = doc(db, 'rideRequests', requestId);
      await updateDoc(requestRef, { status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ride request');
      throw err;
    }
  };

  return {
    rideRequests,
    loading,
    error,
    createRideRequest,
    updateRideRequest,
  };
}
