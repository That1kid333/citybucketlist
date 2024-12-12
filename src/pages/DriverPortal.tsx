import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Overview } from '../components/dashboard/Overview';
import { RidesManagement } from '../components/dashboard/RidesManagement';
import { EarningsCenter } from '../components/dashboard/EarningsCenter';
import { ScheduleManager } from '../components/dashboard/ScheduleManager';
import { CommunicationHub } from '../components/dashboard/CommunicationHub';
import { Settings } from '../components/dashboard/Settings';
import { Driver } from '../types/driver';

type DashboardView = 'overview' | 'rides' | 'earnings' | 'schedule' | 'messages' | 'settings';

export default function DriverPortal() {
  const { user, driver: authDriver, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (authDriver) {
      setDriver(authDriver);
      setIsOnline(authDriver.available);
      
      // Check if this is a new registration
      const isNewRegistration = sessionStorage.getItem('isNewRegistration');
      if (isNewRegistration) {
        sessionStorage.removeItem('isNewRegistration');
        // Set initial view for new registrations
        setCurrentView('overview');
      }
    }
  }, [authDriver]);

  const handleToggleOnline = async (status: boolean) => {
    if (!driver?.id) return;

    try {
      // Update Firestore
      await updateDoc(doc(db, 'drivers', driver.id), {
        available: status,
        updated_at: new Date().toISOString()
      });

      // Update local state
      setIsOnline(status);
      setDriver(prev => prev ? {
        ...prev,
        available: status
      } : null);

    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#C69249] mx-auto mb-4" />
          <p className="text-[#C69249]">Loading driver portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/driver/login';
    return null;
  }

  if (!driver) {
    window.location.href = '/driver/registration';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
            </div>
          ) : (
            <>
              {currentView === 'overview' && <Overview driver={driver} />}
              {currentView === 'rides' && <RidesManagement driver={driver} />}
              {currentView === 'earnings' && <EarningsCenter driver={driver} />}
              {currentView === 'schedule' && <ScheduleManager driver={driver} />}
              {currentView === 'messages' && <CommunicationHub driver={driver} />}
              {currentView === 'settings' && <Settings driver={driver} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}