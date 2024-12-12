import React from 'react';
import { Star, Car } from 'lucide-react';
import { Driver } from '../types/driver';

interface DriverPreviewCardProps {
  driver: Driver;
  selected?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
}

export const DriverPreviewCard: React.FC<DriverPreviewCardProps> = ({
  driver,
  selected = false,
  onClick,
  onSelect
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect();
  };

  return (
    <div
      className={`w-full p-4 rounded-lg transition-all ${
        selected 
          ? 'bg-[#F5A623]/10 border-2 border-[#F5A623]' 
          : 'bg-neutral-900 border-2 border-transparent hover:border-[#F5A623]/50'
      }`}
    >
      <div className="flex flex-col items-center space-y-2">
        {/* Driver Image */}
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

        {/* Driver Name */}
        <div className="text-white font-medium">{driver.name}</div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-white">
            {driver.rating?.toFixed(1) || '5.0'}
          </span>
        </div>

        {/* License Plate */}
        {driver.vehicle?.plate && (
          <div className="flex items-center space-x-1 text-neutral-400">
            <Car className="w-4 h-4" />
            <span>Plate: {driver.vehicle.plate}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleClick}
            className="flex-1 py-2 px-3 text-sm rounded bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={handleSelect}
            className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
              selected
                ? 'bg-[#F5A623] text-white hover:bg-[#E09612]'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
};
