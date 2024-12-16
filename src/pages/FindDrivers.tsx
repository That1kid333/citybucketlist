import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DriverProfileCard } from '../components/DriverProfileCard';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Driver } from '../types/driver';
import { toast } from 'react-hot-toast';
import { locations } from '../types/location';

export default function FindDrivers() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [allDrivers, setAllDrivers] = useState<{ [key: string]: Driver[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Listen to current driver's data
  useEffect(() => {
    if (!user?.uid) return;

    const driverDoc = doc(db, 'drivers', user.uid);
    const unsubscribe = onSnapshot(driverDoc, (doc) => {
      if (doc.exists()) {
        const data = { id: doc.id, ...doc.data() } as Driver;
        setDriverData(data);
        setIsOnline(data.available || false);
      } else {
        setDriverData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Fetch all drivers grouped by location
  useEffect(() => {
    console.log('Starting to fetch all drivers...');
    const fetchAllDrivers = async () => {
      try {
        setLoading(true);
        const driversRef = collection(db, 'drivers');
        const querySnapshot = await getDocs(driversRef);

        console.log('Total drivers found in database:', querySnapshot.size);

        // Map all drivers without any filtering
        const drivers = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing driver:', { id: doc.id, locationId: data.locationId, username: data.username });
          return { id: doc.id, ...data } as Driver;
        });

        // Group drivers by location
        const groupedDrivers = drivers.reduce((acc, driver) => {
          const locationId = driver.locationId || 'unassigned';
          if (!acc[locationId]) {
            acc[locationId] = [];
          }
          acc[locationId].push(driver);
          return acc;
        }, {} as { [key: string]: Driver[] });

        // Sort drivers within each location
        Object.keys(groupedDrivers).forEach(locationId => {
          groupedDrivers[locationId].sort((a, b) => 
            (a.username || a.email || '').localeCompare(b.username || b.email || '')
          );
          console.log(`Location ${locationId}: ${groupedDrivers[locationId].length} drivers`);
        });

        console.log('Final grouped drivers:', groupedDrivers);
        setAllDrivers(groupedDrivers);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast.error('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDrivers();
  }, []);

  const handleToggleOnline = async (checked: boolean) => {
    if (!user?.uid || !driverData) return;

    try {
      const driverRef = doc(db, 'drivers', user.uid);
      await updateDoc(driverRef, {
        available: checked
      });
      setIsOnline(checked);
      toast.success(checked ? 'You are now online' : 'You are now offline');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex justify-center items-center h-64">
            <p className="text-white">Loading drivers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4">
        {user?.uid && driverData && (
          <div className="mb-8 flex items-center justify-between bg-zinc-900 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-[#C69249]" />
              <span className="text-white">
                {isOnline ? 'You are online' : 'You are offline'}
              </span>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
            />
          </div>
        )}

        <div className="space-y-12">
          {Object.entries(allDrivers).map(([locationId, drivers]) => {
            // For the 'unassigned' group, use a different title
            const locationName = locationId === 'unassigned' 
              ? 'Unassigned Location' 
              : locations.find(loc => loc.id === locationId)?.name || locationId;

            return (
              <div key={locationId} className="space-y-4">
                <h2 className="text-xl font-bold text-[#C69249]">
                  {locationName} ({drivers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map((driver) => (
                    <DriverProfileCard
                      key={driver.id}
                      driver={driver}
                      showAvailabilityStatus={true}
                      className="bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(allDrivers).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No drivers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
