import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Avatar, Rate } from 'antd';
import { User } from 'lucide-react';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  rating?: number;
  vehicleType?: string;
  status: string;
}

const AvailableDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driversRef = collection(db, 'drivers');
        const q = query(driversRef, where('status', '==', 'available'));
        const querySnapshot = await getDocs(q);
        
        const driversData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Driver));
        
        setDrivers(driversData);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  if (loading) {
    return <div className="text-white">Loading available drivers...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {drivers.map((driver) => (
        <Card 
          key={driver.id}
          className="bg-zinc-800 border-zinc-700"
        >
          <div className="flex items-center space-x-4">
            <Avatar 
              size={64}
              icon={<User />}
              className="bg-[#C69249]"
            >
              {driver.firstName?.[0]}{driver.lastName?.[0]}
            </Avatar>
            <div>
              <h3 className="text-white text-lg font-medium">
                {driver.firstName} {driver.lastName}
              </h3>
              {driver.rating && (
                <Rate 
                  disabled 
                  defaultValue={driver.rating} 
                  className="text-[#C69249]"
                />
              )}
              {driver.vehicleType && (
                <p className="text-zinc-400 mt-1">
                  Vehicle: {driver.vehicleType}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
      {drivers.length === 0 && (
        <div className="text-white col-span-full text-center py-8">
          No drivers are currently available.
        </div>
      )}
    </div>
  );
};

export default AvailableDrivers;
