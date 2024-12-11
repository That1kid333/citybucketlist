import React, { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, Archive, User } from 'lucide-react';
import { DriverChatBox } from '../DriverChatBox';
import { ridesService } from '../../lib/services/rides.service';
import { Driver } from '../../types/driver';

interface Ride {
  id: string;
  customerName: string;
  phone: string;
  status: string;
  pickup: string;
  dropoff: string;
  scheduled_time: string;
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
  driverId: string;
  isAdmin?: boolean;
}

export function RidesManagement({ driverId, isAdmin = false }: RidesManagementProps) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    if (!driverId) {
      setError('Driver ID is required');
      setIsLoading(false);
      return;
    }

    if (isAdmin) {
      loadAvailableRides();
      loadAvailableDrivers();
    } else {
      loadDriverRides();
    }
  }, [driverId, isAdmin]);

  const loadAvailableRides = async () => {
    try {
      const unsubscribe = ridesService.subscribeToAvailableRides((fetchedRides) => {
        setRides(fetchedRides);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError('Failed to load available rides');
      console.error(err);
      setIsLoading(false);
    }
  };

  const loadDriverRides = async () => {
    if (!driverId) {
      setError('Driver ID is required');
      setIsLoading(false);
      return;
    }

    try {
      const unsubscribe = ridesService.subscribeToRides(driverId, (fetchedRides) => {
        setRides(fetchedRides);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError('Failed to load rides');
      console.error(err);
      setIsLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Error updating ride status:', err);
    }
  };

  const handleAssignDriver = async (rideId: string, driverId: string) => {
    try {
      await ridesService.assignDriver(rideId, driverId);
    } catch (err) {
      console.error('Error assigning driver:', err);
    }
  };

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
        {isAdmin ? 'Available Rides' : 'Your Rides'}
      </h2>

      {rides.length === 0 ? (
        <div className="bg-neutral-900 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <Archive className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isAdmin 
                ? 'No Available Rides'
                : 'No Active Rides'
              }
            </h3>
            <p className="text-neutral-400">
              {isAdmin
                ? 'There are currently no pending rides that need to be assigned to drivers.'
                : 'You don\'t have any active rides at the moment. New rides will appear here when they\'re assigned to you.'
              }
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
                  <h3 className="text-lg font-semibold mb-1">
                    {ride.customerName}
                  </h3>
                  <p className="text-neutral-400">{ride.phone}</p>
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
                <div className="flex items-center gap-2 text-neutral-400">
                  <MapPin className="w-4 h-4" />
                  <span>Pickup: {ride.pickup}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <MapPin className="w-4 h-4" />
                  <span>Drop-off: {ride.dropoff}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(ride.scheduled_time).toLocaleDateString()} {new Date(ride.scheduled_time).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {isAdmin && ride.status === 'pending' && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Available Drivers</h4>
                  <div className="grid gap-2">
                    {availableDrivers.map((driver) => (
                      <button
                        key={driver.id}
                        onClick={() => handleAssignDriver(ride.id, driver.id)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                      >
                        {driver.photo ? (
                          <img
                            src={driver.photo}
                            alt={driver.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 p-1 rounded-full border border-neutral-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-neutral-400">
                            Rating: {driver.rating}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isAdmin && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(ride.id, 'completed')}
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
                </div>
              )}
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
    </div>
  );
}