import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { Driver } from '../../types/driver';
import { Ride } from '../../types/ride';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, MessageSquare } from 'lucide-react';

interface RideWithId extends Ride {
  id: string;
}

export default function RiderSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rides, setRides] = useState<RideWithId[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiderSchedule = async () => {
      if (!user?.uid) {
        navigate('/login');
        return;
      }

      try {
        const ridesRef = collection(db, 'rides');
        const q = query(ridesRef, where('riderId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const rideData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RideWithId[];

        setRides(rideData);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        toast.error('Failed to load schedule');
      }
    };

    fetchRiderSchedule();
  }, [user, navigate]);

  useEffect(() => {
    const fetchAvailableDrivers = async () => {
      try {
        const driversRef = collection(db, 'drivers');
        const q = query(driversRef, where('available', '==', true));
        const querySnapshot = await getDocs(q);
        
        const driverData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Driver[];

        setAvailableDrivers(driverData);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast.error('Failed to load available drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDrivers();
  }, []);

  const handleDriverSelect = async (rideId: string, driverId: string) => {
    try {
      const selectedDriver = availableDrivers.find(d => d.id === driverId);
      if (!selectedDriver) {
        toast.error('Selected driver not found');
        return;
      }

      const rideRef = doc(db, 'rides', rideId);
      await updateDoc(rideRef, {
        driverId: driverId,
        driverName: selectedDriver.name,
        status: 'assigned',
        updated_at: new Date().toISOString()
      });

      // Update local state
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { 
                ...ride, 
                driverId, 
                driverName: selectedDriver.name,
                status: 'assigned' 
              } 
            : ride
        )
      );

      toast.success('Driver assigned successfully');
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h1>
        
        <div className="space-y-4">
          {rides.map(ride => (
            <div 
              key={ride.id} 
              className="bg-white rounded-lg shadow-sm p-4 space-y-3"
            >
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(ride.date).toLocaleDateString()}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>{ride.time}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  {ride.driverName || 'No driver assigned'}
                </span>
              </div>

              {!ride.driverId && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Driver
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    onChange={(e) => handleDriverSelect(ride.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a driver</option>
                    {availableDrivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} {driver.rating && `(${driver.rating}★)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  ride.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ride.status?.charAt(0).toUpperCase() + ride.status?.slice(1)}
                </span>
                
                {ride.driverId && (
                  <button
                    onClick={() => navigate(`/messages/${ride.driverId}`)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Message Driver
                  </button>
                )}
              </div>
            </div>
          ))}

          {rides.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No scheduled rides found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
