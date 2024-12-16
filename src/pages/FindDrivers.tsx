import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DriverProfileCard } from '../components/DriverProfileCard';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
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

  // Listen to all available drivers
  useEffect(() => {
    // Set up real-time listener for available drivers
    const driversRef = collection(db, 'drivers');
    const q = query(
      driversRef,
      where('available', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const drivers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Driver))
        .filter(d => d.id !== user?.uid);
      
      // Group drivers by location
      const groupedDrivers = drivers.reduce((acc, driver) => {
        const locationId = driver.locationId;
        if (!acc[locationId]) {
          acc[locationId] = [];
        }
        acc[locationId].push(driver);
        return acc;
      }, {} as { [key: string]: Driver[] });
      
      console.log('Grouped drivers by location:', groupedDrivers); // Debug log
      setAllDrivers(groupedDrivers);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleToggleOnline = async (checked: boolean) => {
    if (!user?.uid || !driverData) return;

    try {
      console.log('Updating driver status:', { checked, driverId: user.uid }); // Debug log
      const driverRef = doc(db, 'drivers', user.uid);
      await updateDoc(driverRef, {
        available: checked,
        updated_at: new Date().toISOString()
      });
      
      console.log('Driver status updated successfully'); // Debug log
      setIsOnline(checked);
      toast.success(checked ? 'You are now online!' : 'You are now offline');
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Failed to update status');
      setIsOnline(!checked);
    }
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-white text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-white text-center">
            No driver profile found. Please contact support.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[#C69249] text-3xl font-bold">Driver Dashboard</h1>
              <p className="text-white mt-2">
                Your Location: {getLocationName(driverData.locationId)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                className="data-[state=checked]:bg-[#C69249]"
              />
            </div>
          </div>

          <div className="grid gap-8">
            {/* Your Profile Section */}
            <div>
              <h2 className="text-white text-xl mb-4">Your Driver Profile</h2>
              <DriverProfileCard driver={driverData} />
            </div>
            
            {/* All Available Drivers Section */}
            <div>
              <h2 className="text-white text-xl mb-4">Available Drivers by Location</h2>
              {Object.entries(allDrivers).length > 0 ? (
                Object.entries(allDrivers).map(([locationId, drivers]) => (
                  <div key={locationId} className="mb-8">
                    <h3 className="text-[#C69249] text-lg mb-4">
                      {getLocationName(locationId)} ({drivers.length} {drivers.length === 1 ? 'Driver' : 'Drivers'})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {drivers.map(driver => (
                        <DriverProfileCard key={driver.id} driver={driver} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-400">
                  No other drivers currently available.
                </p>
              )}
            </div>
          </div>

          <div className="bg-neutral-900 rounded-lg p-6 mt-8">
            <h2 className="text-white text-xl mb-4">Status</h2>
            <p className="text-neutral-400">
              {isOnline
                ? 'You are currently online and visible to riders. You will receive ride requests in your area.'
                : 'You are currently offline. Go online to start receiving ride requests.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
