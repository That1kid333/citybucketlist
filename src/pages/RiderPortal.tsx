import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import RiderOverview from '../components/RiderOverview';
import RideHistory from '../components/dashboard/RideHistory';
import ScheduleRides from '../components/dashboard/ScheduleRides';
import Messages from '../components/dashboard/Messages';
import Settings from '../components/dashboard/Settings';
import Membership from '../components/dashboard/Membership';
import { MobileNavigation } from '../components/mobile/MobileNavigation';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { Rider } from '../types/rider';

type DashboardView = 'overview' | 'rides' | 'schedule' | 'messages' | 'settings' | 'membership';

export default function RiderPortal() {
  const { user, rider: authRider, loading, signOut } = useAuth();
  const [rider, setRider] = useState<Rider | null>(null);
  const [userInitials, setUserInitials] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split('/').pop() || 'overview';
  const [currentView, setCurrentView] = useState<DashboardView>(currentPath as DashboardView);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'riders', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`;
          setUserInitials(initials.toUpperCase());
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'overview';
    setCurrentView(path as DashboardView);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <RiderOverview rider={rider} />;
      case 'rides':
        return <RideHistory />;
      case 'schedule':
        return <ScheduleRides />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return rider ? <Settings user={user} userType="rider" /> : null;
      case 'membership':
        return <Membership />;
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

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Please sign in to access the rider portal</div>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading your rider profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          userType="rider"
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      <MobileNavigation
        userType="rider"
        currentView={currentView}
        userName={rider?.name}
        userPhoto={rider?.photoURL}
        notificationCount={0}
        onSignOut={handleSignOut}
      >
        <div className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </div>
      </MobileNavigation>
    </div>
  );
}
