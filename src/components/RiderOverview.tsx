import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Rider } from '../types/rider';
import { Car, Calendar, Clock } from 'lucide-react';

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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Rider Overview</h2>
      <Card className="bg-zinc-900 border-zinc-800">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card className="bg-zinc-800 border-zinc-700">
              <Statistic 
                title={
                  <div className="flex items-center text-zinc-400">
                    <Car className="w-4 h-4 mr-2 text-[#C69249]" />
                    <span>Completed Rides</span>
                  </div>
                }
                value={completedRides}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="bg-zinc-800 border-zinc-700">
              <Statistic 
                title={
                  <div className="flex items-center text-zinc-400">
                    <Calendar className="w-4 h-4 mr-2 text-[#C69249]" />
                    <span>Member Since</span>
                  </div>
                }
                value={formatDate(rider.createdAt)}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="bg-zinc-800 border-zinc-700">
              <Statistic 
                title={
                  <div className="flex items-center text-zinc-400">
                    <Clock className="w-4 h-4 mr-2 text-[#C69249]" />
                    <span>Last Ride</span>
                  </div>
                }
                value={formatDate(lastRideDate)}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RiderOverview;
