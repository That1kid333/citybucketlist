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
    <div className={`bg-white rounded-lg p-6 max-w-sm ${className}`}>
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
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
          {driver.photoURL ? (
            <img
              src={driver.photoURL}
              alt={driver.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-purple-500 flex items-center justify-center">
              <span className="text-white text-3xl">
                {driver.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Driver Name and Rating */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{driver.name}</h3>
          <div className="flex items-center justify-center mt-1">
            <span className="text-yellow-500">★</span>
            <span className="text-gray-600 ml-1">
              {driver.rating?.toFixed(1) || '5.0'}
            </span>
          </div>
        </div>

        {/* Vehicle Information */}
        {driver.vehicle && (
          <div className="w-full bg-gray-50 rounded-lg overflow-hidden">
            {/* Vehicle Image */}
            <div className="relative w-full h-48 bg-white flex items-center justify-center p-4 border-b border-gray-100">
              <img
                src={vehicleImage}
                alt={`${driver.vehicle.make} ${driver.vehicle.model}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Vehicle Details */}
            <div className="p-4">
              <h4 className="text-gray-900 font-medium mb-3">Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Make:</span>
                  <p className="font-medium text-gray-900">{driver.vehicle.make}</p>
                </div>
                <div>
                  <span className="text-gray-600">Model:</span>
                  <p className="font-medium text-gray-900">{driver.vehicle.model}</p>
                </div>
                <div>
                  <span className="text-gray-600">Year:</span>
                  <p className="font-medium text-gray-900">{driver.vehicle.year}</p>
                </div>
                <div>
                  <span className="text-gray-600">Color:</span>
                  <div className="flex items-center mt-1">
                    <span className="font-medium text-gray-900">{driver.vehicle.color}</span>
                    <span
                      className="w-4 h-4 rounded-full ml-2 border border-gray-200"
                      style={{ backgroundColor: vehicleColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-medium ${
          driver.available 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {driver.available ? 'Available' : 'Offline'}
        </div>
      </div>
    </div>
  );
};
