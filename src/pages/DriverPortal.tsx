import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Overview from '../components/dashboard/Overview';
import RidesManagement from '../components/dashboard/RidesManagement';
import ScheduleManager from '../components/dashboard/ScheduleManager';
import CommunicationHub from '../components/dashboard/CommunicationHub';
import Settings from '../components/dashboard/Settings';
import DriverInformation from '../components/dashboard/DriverInformation';
import { MobileNavigation } from '../components/mobile/MobileNavigation';
import { useAuth } from '../providers/AuthProvider';
import { Driver } from '../types/driver';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function DriverPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!user?.uid) {
        navigate('/driver/login');
        return;
      }

      try {
        setIsLoading(true);
        const driverRef = doc(db, 'drivers', user.uid);
        const driverSnap = await getDoc(driverRef);
        
        if (driverSnap.exists()) {
          const driverData = { 
            id: driverSnap.id, 
            ...driverSnap.data() 
          } as Driver;
          setDriver(driverData);
          setIsOnline(driverData.available || false);
        } else {
          toast.error('Driver profile not found');
          navigate('/driver/login');
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
        toast.error('Failed to load driver profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverData();
  }, [user, navigate]);

  useEffect(() => {
    fetchAvailableDrivers();
  }, []);

  const fetchAvailableDrivers = async () => {
    try {
      const driversRef = collection(db, 'drivers');
      const q = query(
        driversRef,
        where('isAvailable', '==', true),
        where('id', '!=', user?.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const drivers: Driver[] = [];
      
      querySnapshot.forEach((doc) => {
        drivers.push({ id: doc.id, ...doc.data() } as Driver);
      });
      
      setAvailableDrivers(drivers);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
    }
  };

  const handleToggleOnline = (status: boolean) => {
    setIsOnline(status);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleTransferRide = async (driverId: string) => {
    if (!selectedRide) return;

    try {
      const rideRef = doc(db, 'rides', selectedRide);
      await updateDoc(rideRef, {
        driverId: driverId,
        status: 'transferred',
        transferredAt: new Date().toISOString(),
      });

      setShowTransferModal(false);
      setSelectedRide(null);
      // Refresh the rides list
      window.location.reload();
    } catch (error) {
      console.error('Error transferring ride:', error);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state if no driver data
  if (!driver) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Driver Not Found
          </h1>
          <p className="text-neutral-400 mb-6">
            We could not find your driver profile. Please try logging in again.
          </p>
          <button
            onClick={() => navigate('/driver/login')}
            className="w-full bg-[#C69249] text-white py-2 px-4 rounded hover:bg-[#B58239]"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MobileNavigation
        userType="driver"
        currentView={location.pathname.split('/').pop() || 'overview'}
        userName={driver?.name}
        userPhoto={driver?.photoURL}
        notificationCount={0}
        onSignOut={handleSignOut}
      >
        <div className="p-4">
          {location.pathname.endsWith('/settings') || location.pathname.includes('/portal/settings') ? (
            <>
              <DriverInformation driver={driver} />
              <div className="mt-6">
                <Settings user={driver} userType="driver" />
              </div>
            </>
          ) : location.pathname.includes('/schedule') ? (
            <ScheduleManager driver={driver} />
          ) : location.pathname.includes('/messages') ? (
            <CommunicationHub driver={driver} />
          ) : location.pathname.includes('/rides') ? (
            <RidesManagement 
              driver={driver}
              onTransferRide={(rideId) => {
                setSelectedRide(rideId);
                setShowTransferModal(true);
              }}
            />
          ) : (
            <Overview driver={driver} />
          )}
        </div>
      </MobileNavigation>

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-lg">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Transfer Ride</h3>
            </div>

            <div className="p-6 space-y-4">
              {availableDrivers.length === 0 ? (
                <p className="text-zinc-400">No available drivers found.</p>
              ) : (
                <div className="space-y-3">
                  {availableDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleTransferRide(driver.id)}
                      className="w-full flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-zinc-400">{driver.phone}</p>
                      </div>
                      <span className="text-[#C69249]">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedRide(null);
                }}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}