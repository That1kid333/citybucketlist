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
  driver: Driver;
  isOnline: boolean;
  onToggleOnline: (status: boolean) => void;
}

export function Overview({ driver, isOnline, onToggleOnline }: OverviewProps) {
  useEffect(() => {
    // Load initial online status from driver data
    if (driver?.available !== undefined) {
      onToggleOnline(driver.available);
    }
  }, [driver?.available, onToggleOnline]);

  return (
    <div className="space-y-6">
      {/* Driver Profile Header */}
      <div className="bg-neutral-900 rounded-lg p-6">
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
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-neutral-900 ${
              isOnline ? 'bg-green-500' : 'bg-gray-500'
            }`} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white">{driver.name}</h2>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1">{driver.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{driver.totalRides || 0} Rides</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Hours Online</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.hoursOnline || '0'}h
          </p>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Car className="w-5 h-5" />
            <span className="text-sm font-medium">Today's Rides</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.todayRides || 0}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium">Acceptance Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.acceptanceRate || '100'}%
          </p>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Timer className="w-5 h-5" />
            <span className="text-sm font-medium">Response Time</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.responseTime || '0'}s
          </p>
        </div>
      </div>

      {/* Schedule Overview */}
      <div className="bg-neutral-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Next Shift</span>
          </div>
          <BellRing className="w-5 h-5 text-[#F5A623]" />
        </div>
        <p className="text-white">
          {driver.schedule?.length 
            ? `Next shift starts at ${driver.schedule[0].hours}`
            : 'No upcoming shifts scheduled'}
        </p>
      </div>
    </div>
  );
}