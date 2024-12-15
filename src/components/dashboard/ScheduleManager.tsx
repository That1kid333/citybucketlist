import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Driver } from '../../types/driver';
import { Ride } from '../../types/ride';
import { toast } from 'react-hot-toast';
import { Calendar } from 'lucide-react';
import { ConnectionsManager } from './ConnectionsManager';

interface ScheduleManagerProps {
  driver?: Driver;
  riderId?: string;
  userType: 'driver' | 'rider';
}

interface Connection {
  id: string;
  driverId: string;
  riderId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function ScheduleManager({ driver, riderId, userType }: ScheduleManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [connectedDrivers, setConnectedDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userType === 'rider') {
      fetchConnectedDrivers();
    }
  }, [riderId]);

  const fetchConnectedDrivers = async () => {
    if (!riderId) return;

    try {
      // Fetch accepted connections for this rider
      const connectionsRef = collection(db, 'connections');
      const q = query(
        connectionsRef,
        where('riderId', '==', riderId),
        where('status', '==', 'accepted')
      );
      
      const querySnapshot = await getDocs(q);
      const driverIds = querySnapshot.docs.map(doc => doc.data().driverId);
      
      // Fetch driver details for connected drivers
      const driversRef = collection(db, 'drivers');
      const driversData: Driver[] = [];
      
      for (const driverId of driverIds) {
        const driverQuery = query(driversRef, where('id', '==', driverId));
        const driverSnapshot = await getDocs(driverQuery);
        
        driverSnapshot.forEach(doc => {
          driversData.push({ id: doc.id, ...doc.data() } as Driver);
        });
      }
      
      setConnectedDrivers(driversData);
    } catch (error) {
      console.error('Error fetching connected drivers:', error);
      toast.error('Failed to load connected drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleRide = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        toast.error('Please select a date and time');
        return;
      }

      if (userType === 'rider' && !selectedDriver) {
        toast.error('Please select a driver');
        return;
      }

      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      const rideData: Partial<Ride> = {
        driverId: userType === 'driver' ? driver?.id : selectedDriver,
        riderId: userType === 'rider' ? riderId : null,
        scheduledTime: scheduledDateTime.toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'rides'), rideData);
      toast.success('Ride scheduled successfully');
      
      // Reset form
      setSelectedTime('');
      if (userType === 'rider') {
        setSelectedDriver('');
      }
    } catch (error) {
      console.error('Error scheduling ride:', error);
      toast.error('Failed to schedule ride');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-neutral-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Schedule a Ride</h2>
        
        <div className="space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-neutral-800 px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-neutral-800 px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
            />
          </div>

          {/* Driver Selection (Only for riders) */}
          {userType === 'rider' && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Select Driver
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full bg-neutral-800 px-3 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
              >
                <option value="">Select a driver</option>
                {connectedDrivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Schedule Button */}
          <button
            onClick={handleScheduleRide}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Schedule Ride
          </button>
        </div>
      </div>

      {/* Connections Manager */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          {userType === 'rider' ? 'Manage Drivers' : 'Manage Riders'}
        </h2>
        <ConnectionsManager
          userType={userType}
          userId={userType === 'driver' ? driver?.id : riderId}
          onConnectionUpdate={userType === 'rider' ? fetchConnectedDrivers : undefined}
        />
      </div>
    </div>
  );
}