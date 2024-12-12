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
import { DriverSchedule } from '../components/dashboard/DriverSchedule';

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview 
          driver={driver} 
          isOnline={isOnline} 
          onToggleOnline={handleToggleOnline} 
        />;
      case 'rides':
        return driver?.id ? (
          <RidesManagement driverId={driver.id} />
        ) : (
          <div className="p-4 text-red-600">Error: Driver ID not found</div>
        );
      case 'earnings':
        return <EarningsCenter driver={driver} />;
      case 'schedule':
        return <DriverSchedule />;
      case 'messages':
        return <CommunicationHub driver={driver} />;
      case 'settings':
        return <Settings driver={driver} />;
      default:
        return <Overview 
          driver={driver} 
          isOnline={isOnline} 
          onToggleOnline={handleToggleOnline} 
        />;
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
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="flex-1 p-8">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}