import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Driver } from '../../types/driver';
import { Ride } from '../../types/ride';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User } from 'lucide-react';
import { ConnectionsManager } from '../dashboard/ConnectionsManager';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface MobileScheduleManagerProps {
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

export function MobileScheduleManager({ driver, riderId, userType }: MobileScheduleManagerProps) {
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
      const connectionsRef = collection(db, 'connections');
      const q = query(
        connectionsRef,
        where('riderId', '==', riderId),
        where('status', '==', 'accepted')
      );
      
      const querySnapshot = await getDocs(q);
      const driverIds = querySnapshot.docs.map(doc => doc.data().driverId);
      
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

  const createNotification = async (userId: string, title: string, message: string, type: 'connection_request' | 'connection_accepted' | 'ride_request' | 'ride_accepted') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
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

      const rideRef = await addDoc(collection(db, 'rides'), rideData);

      // Send notification to the driver
      const targetDriverId = userType === 'driver' ? driver?.id : selectedDriver;
      if (targetDriverId) {
        const selectedDriverData = connectedDrivers.find(d => d.id === selectedDriver);
        const formattedTime = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }).format(scheduledDateTime);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }).format(scheduledDateTime);

        await createNotification(
          targetDriverId,
          'New Ride Scheduled',
          `A rider has scheduled a ride with you for ${formattedTime} on ${formattedDate}`,
          'ride_request'
        );
      }

      toast.success('Ride scheduled successfully');
      
      // Reset form
      setSelectedDate(new Date());
      setSelectedTime('');
      setSelectedDriver('');
    } catch (error) {
      console.error('Error scheduling ride:', error);
      toast.error('Failed to schedule ride');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-white">Schedule a Ride</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Date</label>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-white" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full p-2 rounded-md border border-gray-700 bg-white text-black focus:ring-2 focus:ring-[#C69249] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">Time</label>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-white" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-700 bg-white text-black focus:ring-2 focus:ring-[#C69249] focus:border-transparent"
              />
            </div>
          </div>

          {userType === 'rider' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Select Driver</label>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-white" />
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full p-2 rounded-md border border-gray-700 bg-white text-black focus:ring-2 focus:ring-[#C69249] focus:border-transparent"
                >
                  <option key="default" value="">Select a driver</option>
                  {connectedDrivers.map((driver, index) => (
                    <option key={`${driver.id}-${index}`} value={driver.id} className="text-black">
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button
            onClick={handleScheduleRide}
            className="w-full bg-[#C69249] hover:bg-[#B58239] text-white"
            disabled={isLoading}
          >
            Schedule Ride
          </Button>
        </div>
      </Card>

      {userType === 'rider' && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4 text-white">Connected Drivers</h2>
          <ConnectionsManager riderId={riderId} />
        </Card>
      )}
    </div>
  );
}
