import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Driver } from '../../types/driver';
import { User } from '../../types/user';

interface RidersManagementProps {
  driver: Driver | null;
}

export function RidersManagement({ driver }: RidersManagementProps) {
  const [riders, setRiders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const ridersQuery = query(collection(db, 'users'));
        const ridersSnapshot = await getDocs(ridersQuery);
        const ridersData = ridersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as User))
          .filter(user => user.role === 'rider');
        
        setRiders(ridersData);
      } catch (error) {
        console.error('Error fetching riders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Manage Riders</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riders.map((rider) => (
          <div 
            key={rider.id}
            className="bg-zinc-800 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-[#C69249] flex items-center justify-center">
                {rider.displayName?.[0] || rider.email[0]}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {rider.displayName || 'Anonymous Rider'}
                </h3>
                <p className="text-sm text-zinc-400">{rider.email}</p>
              </div>
            </div>
            
            <div className="text-sm text-zinc-400">
              <p>Member since: {new Date(rider.createdAt).toLocaleDateString()}</p>
              <p>Total Rides: {rider.totalRides || 0}</p>
            </div>
            
            <div className="pt-2">
              <button 
                className="w-full px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
                onClick={() => {/* TODO: Implement view rider details */}}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {riders.length === 0 && (
        <div className="text-center text-zinc-400 py-8">
          No riders found.
        </div>
      )}
    </div>
  );
}
