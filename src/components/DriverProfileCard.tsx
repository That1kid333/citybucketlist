import React from 'react';
import { X } from 'lucide-react';
import { Driver } from '../types/driver';
import { getColorHex, getVehicleImage } from '../data/vehicles';

interface DriverProfileCardProps {
  driver: Driver;
  onClose?: () => void;
  className?: string;
}

export const DriverProfileCard: React.FC<DriverProfileCardProps> = ({
  driver,
  onClose,
  className = '',
}) => {
  const vehicleColor = driver.vehicle?.color ? getColorHex(driver.vehicle.color) : '#000000';
  const vehicleImage = driver.vehicle ? getVehicleImage(driver.vehicle.make, driver.vehicle.model) : '';

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg ${className}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          <X size={20} />
        </button>
      )}

      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
          {driver.photoURL ? (
            <img
              src={driver.photoURL}
              alt={driver.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-3xl">
                {driver.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Driver Name and Rating */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{driver.name}</h3>
        <div className="flex items-center gap-1 mb-6">
          <span className="text-yellow-400">★</span>
          <span className="text-gray-700">
            {driver.rating?.toFixed(1) || '5.0'}
          </span>
        </div>

        {/* Vehicle Information */}
        {driver.vehicle && (
          <>
            {/* Vehicle Image */}
            <div className="w-full mb-6">
              <img
                src={vehicleImage}
                alt={`${driver.vehicle.make} ${driver.vehicle.model}`}
                className="w-full h-32 object-contain"
              />
            </div>

            {/* Vehicle Details */}
            <div className="w-full">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Make:</p>
                  <p className="font-medium">{driver.vehicle.make}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Model:</p>
                  <p className="font-medium">{driver.vehicle.model}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Year:</p>
                  <p className="font-medium">{driver.vehicle.year}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Color:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{driver.vehicle.color}</p>
                    <span
                      className="w-4 h-4 rounded-full inline-block border border-gray-200"
                      style={{ backgroundColor: vehicleColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Availability Status */}
        <div className="mt-6">
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              driver.available
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {driver.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
};
