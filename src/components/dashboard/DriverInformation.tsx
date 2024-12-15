import React from 'react';
import { Star, Calendar, Car, Tag } from 'lucide-react';
import { Driver } from '../../types/driver';

interface DriverInformationProps {
  driver: Driver;
}

export default function DriverInformation({ driver }: DriverInformationProps) {
  // Calculate how long they've been a driver
  const getDriverDuration = (joinDate: string) => {
    const start = new Date(joinDate);
    const now = new Date();
    const diffYears = now.getFullYear() - start.getFullYear();
    const diffMonths = now.getMonth() - start.getMonth();
    
    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
    } else {
      return 'Less than a month';
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Driver Information</h2>
        <div className="flex items-center space-x-1">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="text-lg font-medium">{driver.rating?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-neutral-400">Driver Name</h3>
            <p className="text-white font-medium">{driver.name}</p>
          </div>

          <div>
            <h3 className="text-sm text-neutral-400">Tag Number</h3>
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-neutral-400" />
              <p className="text-white font-medium">{driver.tagNumber || 'Not provided'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-neutral-400">Experience</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <p className="text-white font-medium">
                {driver.joinDate ? getDriverDuration(driver.joinDate) : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-neutral-400">Vehicle Information</h3>
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-neutral-400" />
              <p className="text-white font-medium">
                {driver.vehicle ? 
                  `${driver.vehicle.year} ${driver.vehicle.make} ${driver.vehicle.model}` :
                  'Not provided'
                }
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-neutral-400">Vehicle Color</h3>
            <p className="text-white font-medium capitalize">
              {driver.vehicle?.color || 'Not provided'}
            </p>
          </div>

          <div>
            <h3 className="text-sm text-neutral-400">Total Rides</h3>
            <p className="text-white font-medium">{driver.totalRides || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
