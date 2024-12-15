import React, { useEffect, useState } from 'react';
import { Car, Calendar, Clock } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Rider } from '../types/rider';

interface RiderOverviewProps {
  rider: Rider;
}

const RiderOverview: React.FC<RiderOverviewProps> = ({ rider }) => {
  const [completedRides, setCompletedRides] = useState(0);
  const [lastRideDate, setLastRideDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRideStats = async () => {
      if (!rider?.id) return;

      try {
        const ridesRef = collection(db, 'rides');
        const q = query(
          ridesRef,
          where('riderId', '==', rider.id),
          where('status', '==', 'completed')
        );
        
        const querySnapshot = await getDocs(q);
        let completedCount = 0;
        let latestRideDate: Date | null = null;

        querySnapshot.forEach((doc) => {
          completedCount++;
          const rideDate = doc.data().date?.toDate();
          if (rideDate && (!latestRideDate || rideDate > latestRideDate)) {
            latestRideDate = rideDate;
          }
        });

        setCompletedRides(completedCount);
        setLastRideDate(latestRideDate);
      } catch (error) {
        console.error('Error fetching ride stats:', error);
      }
    };

    fetchRideStats();
  }, [rider?.id]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Rider Overview</h2>
      <div className="space-y-4">
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center text-zinc-400 mb-2">
            <Car className="w-4 h-4 mr-2 text-[#C69249]" />
            <span>Completed Rides</span>
          </div>
          <div className="text-2xl font-semibold text-white">
            {completedRides}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center text-zinc-400 mb-2">
            <Calendar className="w-4 h-4 mr-2 text-[#C69249]" />
            <span>Member Since</span>
          </div>
          <div className="text-2xl font-semibold text-white">
            {formatDate(rider.createdAt)}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center text-zinc-400 mb-2">
            <Clock className="w-4 h-4 mr-2 text-[#C69249]" />
            <span>Last Ride</span>
          </div>
          <div className="text-2xl font-semibold text-white">
            {formatDate(lastRideDate)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderOverview;
