import React from 'react';
import { useEffect } from 'react';
import { 
  Clock, 
  Car, 
  Star, 
  Timer,
  Calendar,
  BellRing
} from 'lucide-react';
import { Driver } from '../../types/driver';

interface OverviewProps {
  driver: Driver | null;
  isOnline: boolean;
  onToggleOnline: (status: boolean) => void;
}

export function Overview({ driver, isOnline, onToggleOnline }: OverviewProps) {
  useEffect(() => {
    if (driver?.available !== undefined && driver.available !== isOnline) {
      onToggleOnline(driver.available);
    }
  }, [driver?.available, isOnline, onToggleOnline]);

  if (!driver) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  const toggleAvailability = () => {
    onToggleOnline(!isOnline);
  };

  return (
    <div className="space-y-6">
      {/* Driver Profile Header */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              {driver.photoURL ? (
                <img
                  src={driver.photoURL}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-2xl">
                    {driver.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{driver.name}</h2>
              <p className="text-gray-400">Driver ID: {driver.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                isOnline
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-[#C69249]" />
            <h3 className="text-lg font-medium text-white">Vehicle Info</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">Make: {driver.vehicle?.make || 'N/A'}</p>
            <p className="text-gray-400">Model: {driver.vehicle?.model || 'N/A'}</p>
            <p className="text-gray-400">Year: {driver.vehicle?.year || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-[#C69249]" />
            <h3 className="text-lg font-medium text-white">Rating</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">
              {driver.rating?.toFixed(1) || 'N/A'}
            </p>
            <p className="text-gray-400">
              {driver.totalRides || 0} total rides
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-[#C69249]" />
            <h3 className="text-lg font-medium text-white">Status</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">
              Account Status: {driver.status || 'Active'}
            </p>
            <p className="text-gray-400">
              Last Active: {new Date(driver.lastActive || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}