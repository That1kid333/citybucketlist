import React from 'react';
import { X, Star, MapPin, Phone, Mail, Car } from 'lucide-react';
import { Driver } from '../types/driver';

interface DriverDetailsModalProps {
  driver: Driver;
  onClose: () => void;
  onSelect?: () => void;
  selected?: boolean;
}

export function DriverDetailsModal({ 
  driver, 
  onClose, 
  onSelect,
  selected = false 
}: DriverDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Driver Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Driver Profile */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
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
            <div>
              <h3 className="text-xl font-semibold text-white">{driver.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-white">
                  {driver.rating?.toFixed(1) || '5.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-neutral-300">
              <Car className="w-5 h-5" />
              <div>
                <div>{driver.vehicle?.make} {driver.vehicle?.model}</div>
                <div className="text-sm text-neutral-400">
                  {driver.vehicle?.color} • {driver.vehicle?.year}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-neutral-300">
              <MapPin className="w-5 h-5" />
              <span>Serves {driver.locationName || 'Local Area'}</span>
            </div>

            <div className="flex items-center space-x-3 text-neutral-300">
              <Phone className="w-5 h-5" />
              <span>{driver.phone}</span>
            </div>

            <div className="flex items-center space-x-3 text-neutral-300">
              <Mail className="w-5 h-5" />
              <span>{driver.email}</span>
            </div>
          </div>

          {/* Action Button */}
          {onSelect && (
            <button
              onClick={() => {
                if (onSelect) {
                  onSelect();
                  onClose();
                }
              }}
              className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                selected
                  ? 'bg-[#F5A623] text-white hover:bg-[#E09612]'
                  : 'bg-neutral-800 text-white hover:bg-neutral-700'
              }`}
            >
              {selected ? 'Deselect Driver' : 'Select Driver'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
