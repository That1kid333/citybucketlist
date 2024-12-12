import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { RiderOverview } from '../components/dashboard/RiderOverview';
import { RiderRides } from '../components/dashboard/RiderRides';
import { Messages } from '../components/messages/Messages';
import { Settings } from '../components/dashboard/Settings';
import { Rider } from '../types/rider';

type DashboardView = 'overview' | 'rides' | 'messages' | 'settings';

export default function RiderPortal() {
  const { user, rider: authRider, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [rider, setRider] = useState<Rider | null>(null);

  useEffect(() => {
    if (authRider) {
      setRider(authRider);
      
      // Check if this is a new registration
      const isNewRegistration = sessionStorage.getItem('isNewRegistration');
      if (isNewRegistration) {
        sessionStorage.removeItem('isNewRegistration');
        setCurrentView('overview');
      }
    }
  }, [authRider]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <RiderOverview rider={rider} />;
      case 'rides':
        return rider?.id ? (
          <RiderRides riderId={rider.id} />
        ) : (
          <div className="p-4 text-red-600">Error: Rider ID not found</div>
        );
      case 'messages':
        return <Messages user={rider} userType="rider" />;
      case 'settings':
        return <Settings user={rider} userType="rider" />;
      default:
        return <RiderOverview rider={rider} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  if (!user || !rider) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Please sign in to access the rider portal</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          userType="rider"
        />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
