import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Driver } from '../../types/driver';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapPin as MapPinLucide, Clock as ClockLucide, MessageCircle, Archive, User as UserLucide, UserPlus } from 'lucide-react';
import { ridesService } from '../../lib/services/rides.service';
import { useNavigate } from 'react-router-dom';
import DriverChatBox from '../chat/DriverChatBox';
import { X } from 'lucide-react';

interface Ride {
  id: string;
  customerName: string;
  phone: string;
  status: string;
  pickup: string;
  dropoff: string;
  scheduled_time: string;
  selectedDriverId?: string;
  driverId?: string;
  availableDrivers?: Array<{
    id: string;
    name: string;
    photo: string;
    rating: number;
  }>;
  assignedDriver?: {
    id: string;
    name: string;
    photo: string;
    rating: number;
  } | null;
}

interface RidesManagementProps {
  driver: Driver;
}

export default function RidesManagement({ driver }: RidesManagementProps) {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [transferringRide, setTransferringRide] = useState<Ride | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadRides = async () => {
      try {
        if (!driver?.id) {
          setError('Please complete your driver profile first');
          setIsLoading(false);
          return;
        }

        unsubscribe = ridesService.subscribeToDriverRides(driver.id, (rides) => {
          setRides(rides);
          setIsLoading(false);
          setError('');
        });
      } catch (error) {
        console.error('Error loading rides:', error);
        setError('Failed to load rides. Please try again.');
        setIsLoading(false);
      }
    };

    loadRides();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [driver?.id]);

  const loadAvailableDrivers = async () => {
    try {
      console.log('Loading available drivers...');
      const drivers = await ridesService.getAvailableDrivers();
      setAvailableDrivers(drivers);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Failed to load available drivers:', err);
      setError('Failed to load available drivers. Please try again.');
      setAvailableDrivers([]); // Reset drivers on error
    }
  };

  const handleStatusUpdate = async (rideId: string, status: string) => {
    try {
      await ridesService.updateRideStatus(rideId, status);
      if (status === 'completed') {
        navigate('/thank-you');
      }
    } catch (err) {
      console.error('Error updating ride status:', err);
      toast.error('Failed to update ride status');
    }
  };

  const handleAssignDriver = async (rideId: string, driverId: string) => {
    try {
      await ridesService.assignDriver(rideId, driverId);
    } catch (err) {
      console.error('Error assigning driver:', err);
    }
  };

  const handleTransferRide = async (toDriverId: string) => {
    if (!transferringRide) return;

    try {
      await ridesService.transferRide(transferringRide.id, driver.id, toDriverId);
      toast.success('Ride transferred successfully');
      setTransferringRide(null);
    } catch (error) {
      console.error('Error transferring ride:', error);
      toast.error('Failed to transfer ride');
    }
  };

  const handleCompleteRide = async (rideId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        // Update ride status
        const rideRef = doc(db, 'rides', rideId);
        transaction.update(rideRef, {
          status: 'completed',
          completedAt: new Date().toISOString()
        });

        // Update driver stats
        const driverRef = doc(db, 'drivers', driver.id);
        const driverDoc = await transaction.get(driverRef);
        
        if (!driverDoc.exists()) {
          throw new Error('Driver document does not exist!');
        }

        const currentStats = driverDoc.data().stats || {
          totalRides: 0,
          completedRides: 0,
          cancelledRides: 0
        };

        transaction.update(driverRef, {
          'stats.completedRides': increment(1),
          'stats.totalRides': increment(1)
        });
      });

      toast.success('Ride completed successfully!');
      loadRides(); // Refresh the rides list
    } catch (error) {
      console.error('Error completing ride:', error);
      toast.error('Failed to complete ride. Please try again.');
    }
  };

  useEffect(() => {
    const fetchAvailableDrivers = async () => {
      try {
        const drivers = await ridesService.getAvailableDrivers();
        // Filter out the current driver
        setAvailableDrivers(drivers.filter(d => d.id !== driver.id));
      } catch (error) {
        console.error('Error fetching available drivers:', error);
        toast.error('Failed to fetch available drivers');
      }
    };

    if (transferringRide) {
      fetchAvailableDrivers();
    }
  }, [transferringRide, driver.id]);

  if (isLoading) {
    return <div className="text-center py-8">Loading rides...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#C69249]">
        Your Rides
      </h2>

      {rides.length === 0 ? (
        <div className="bg-neutral-900 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <Archive className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Active Rides
            </h3>
            <p className="text-zinc-400">
              You don't have any active rides at the moment. New rides will appear here when they're assigned to you.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-neutral-900 p-6 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {ride.customerName}
                  </h3>
                  <p className="text-zinc-400">{ride.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    ride.status === 'completed' ? 'bg-green-900 text-green-300' :
                    ride.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {ride.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPinLucide className="w-4 h-4" />
                  <span>Pickup: {ride.pickup}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPinLucide className="w-4 h-4" />
                  <span>Drop-off: {ride.dropoff}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <ClockLucide className="w-4 h-4" />
                  <span>
                    {new Date(ride.scheduled_time).toLocaleDateString()} {new Date(ride.scheduled_time).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleCompleteRide(ride.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                  disabled={ride.status === 'completed'}
                >
                  <Archive className="w-4 h-4" />
                  Complete
                </button>
                <button
                  onClick={() => setSelectedRide(ride)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={() => setTransferringRide(ride)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 transition-colors"
                  disabled={ride.status === 'completed' || ride.status === 'transferred'}
                >
                  <UserPlus className="w-4 h-4" />
                  Transfer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRide && (
        <DriverChatBox
          ride={selectedRide}
          onClose={() => setSelectedRide(null)}
        />
      )}

      {/* Transfer Ride Modal */}
      {transferringRide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Transfer Ride</h3>
              <button
                onClick={() => setTransferringRide(null)}
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-400 mb-4">
              Select a driver to transfer this ride to:
            </p>

            {availableDrivers.length === 0 ? (
              <p className="text-zinc-500 text-center py-4">
                No available drivers found
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableDrivers.map((availableDriver) => (
                  <button
                    key={availableDriver.id}
                    onClick={() => handleTransferRide(availableDriver.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                      {availableDriver.photo ? (
                        <img
                          src={availableDriver.photo}
                          alt={availableDriver.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserLucide className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{availableDriver.name}</p>
                      <p className="text-sm text-zinc-400">
                        Rating: {availableDriver.rating?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}