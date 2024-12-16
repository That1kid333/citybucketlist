import React from 'react';
import { X } from 'lucide-react';
import { Driver } from '../types/driver';
import { getColorHex, getVehicleImage } from '../data/vehicles';
import { MapPin, Star, Car } from 'lucide-react';

interface DriverProfileCardProps {
  driver: Driver;
  selected?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
  showAvailabilityStatus?: boolean;
  className?: string;
}

export function DriverProfileCard({
  driver,
  selected,
  onClick,
  onSelect,
  showAvailabilityStatus = false,
  className = ''
}: DriverProfileCardProps) {
  const vehicleColor = driver.vehicle?.color ? getColorHex(driver.vehicle.color) : '#000000';
  const vehicleImage = driver.vehicle ? getVehicleImage(driver.vehicle.make, driver.vehicle.model) : '';

  return (
    <div
      className={`relative p-6 rounded-lg ${
        selected ? 'ring-2 ring-[#C69249]' : ''
      } ${className || 'bg-zinc-900'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {showAvailabilityStatus && (
              <div 
                className={`w-2.5 h-2.5 rounded-full ${
                  driver.available ? 'bg-green-500' : 'bg-gray-500'
                }`} 
              />
            )}
            <h3 className="text-lg font-semibold text-white">
              {driver.name}
            </h3>
          </div>
          
          <div className="space-y-2 text-sm text-gray-400">
            {driver.locationName && (
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {driver.locationName}
              </p>
            )}
            <p className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#C69249]" />
              {driver.rating || '5.0'} Rating
            </p>
            <p className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              {driver.totalRides || '0'} Rides
            </p>
          </div>
        </div>

        {onSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#A77841] transition-colors"
          >
            Select
          </button>
        )}
      </div>

      {driver.available === false && showAvailabilityStatus && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <p className="text-white font-medium">Currently Offline</p>
        </div>
      )}
    </div>
  );
}
