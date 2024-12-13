import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Overview } from '../components/dashboard/Overview';
import { RidesManagement } from '../components/dashboard/RidesManagement';
import { ScheduleManager } from '../components/dashboard/ScheduleManager';
import { CommunicationHub } from '../components/dashboard/CommunicationHub';
import { SavedRiders } from '../components/dashboard/SavedRiders';
import { Settings } from '../components/dashboard/Settings';
import { RidersManagement } from '../components/dashboard/RidersManagement';
import DriverRegistration from './DriverRegistration';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Driver } from '../types/driver';

type DashboardView = 'overview' | 'rides' | 'schedule' | 'messages' | 'manage-riders' | 'settings';

export default function DriverPortal() {
  const { user, driver: authDriver } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (authDriver) {
      setDriver(authDriver);
      setIsOnline(authDriver.available || false);
    }
  }, [authDriver]);

  const handleToggleOnline = async (status: boolean) => {
    if (!driver?.id) return;

    try {
      await updateDoc(doc(db, 'drivers', driver.id), {
        available: status,
        updated_at: new Date().toISOString()
      });

      setIsOnline(status);
      setDriver(prev => prev ? {
        ...prev,
        available: status
      } : null);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  // Loading state is handled by ProtectedRoute
  if (!user || !driver) {
    return null;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <Overview driver={driver} isOnline={isOnline} onToggleOnline={handleToggleOnline} />;
      case 'rides':
        return <RidesManagement driver={driver} />;
      case 'schedule':
        return <ScheduleManager driver={driver} />;
      case 'messages':
        return <CommunicationHub driver={driver} />;
      case 'manage-riders':
        return <SavedRiders />;
      case 'settings':
        return <Settings user={driver} userType="driver" />;
      default:
        return <Overview driver={driver} isOnline={isOnline} onToggleOnline={handleToggleOnline} />;
    }
  };

  return (
    <DashboardLayout>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} userType="driver" />
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </DashboardLayout>
  );
}