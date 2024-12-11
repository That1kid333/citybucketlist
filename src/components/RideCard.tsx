import React, { useState } from 'react';
import { MapPin, Clock, MessageCircle, Archive } from 'lucide-react';
import { RideActions } from './RideActions';
import { DriverChatBox } from './DriverChatBox';

interface Ride {
  id: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  status: string;
  phone: string;
  archived?: boolean;
}

interface RideCardProps {
  ride: Ride;
  isSubmitting: boolean;
  onMessage: (rideId: string) => void;
  onAccept: (ride: Ride) => void;
  onTransfer: (ride: Ride) => void;
  onDecline: (ride: Ride) => void;
  onArchive: (ride: Ride) => void;
}

export function RideCard({
  ride,
  isSubmitting,
  onAccept,
  onTransfer,
  onDecline,
  onArchive
}: RideCardProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div className={`bg-neutral-800 rounded-lg p-6 ${ride.archived ? 'opacity-75' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{ride.customerName}</h3>
            <p className="text-gray-400">{ride.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              ride.status === 'pending' ? 'bg-yellow-600' :
              ride.status === 'accepted' ? 'bg-green-600' :
              ride.status === 'declined' ? 'bg-red-600' :
              'bg-neutral-600'
            }`}>
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
            </span>
            {ride.archived && (
              <span className="px-3 py-1 bg-neutral-700 text-white text-sm rounded-full">
                Archived
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>Pickup: {ride.pickup}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>Dropoff: {ride.dropoff}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{ride.date} at {ride.time}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Message Customer
          </button>
          
          {ride.status === 'pending' && (
            <RideActions
              status={ride.status}
              isSubmitting={isSubmitting}
              onAccept={() => onAccept(ride)}
              onDecline={() => onDecline(ride)}
              onTransfer={() => onTransfer(ride)}
            />
          )}

          {ride.status !== 'pending' && (
            <button
              onClick={() => onArchive(ride)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
            >
              <Archive className="w-4 h-4" />
              {ride.archived ? 'Unarchive' : 'Archive'}
            </button>
          )}
        </div>
      </div>

      {showChat && (
        <DriverChatBox
          ride={ride}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}