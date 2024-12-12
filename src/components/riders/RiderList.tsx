import React from 'react';
import { Rider } from '../../types/rider';
import { formatPhoneNumber } from '../../lib/utils/format';

interface RiderListProps {
  riders: Rider[];
  onEdit: (rider: Rider) => void;
  onDelete: (riderId: string) => Promise<void>;
}

export function RiderList({ riders, onEdit, onDelete }: RiderListProps) {
  const handleDelete = async (riderId: string) => {
    if (window.confirm('Are you sure you want to delete this rider?')) {
      await onDelete(riderId);
    }
  };

  if (riders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No riders added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {riders.map(rider => (
        <div
          key={rider.id}
          className="bg-neutral-800 p-4 rounded-lg border border-neutral-700"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">{rider.name}</h3>
              <p className="text-gray-400">{formatPhoneNumber(rider.phone)}</p>
              {rider.email && (
                <p className="text-gray-400">{rider.email}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(rider)}
                className="text-[#C69249] hover:text-[#A77841] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(rider.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {(rider.pickupAddress || rider.dropoffAddress) && (
            <div className="mt-4 space-y-2">
              {rider.pickupAddress && (
                <p className="text-sm text-white">
                  <span className="text-gray-400">Pickup:</span>{' '}
                  {rider.pickupAddress}
                </p>
              )}
              {rider.dropoffAddress && (
                <p className="text-sm text-white">
                  <span className="text-gray-400">Dropoff:</span>{' '}
                  {rider.dropoffAddress}
                </p>
              )}
            </div>
          )}

          {rider.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">{rider.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
