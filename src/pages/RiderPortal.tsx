import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Layout, Avatar } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Sidebar } from '../components/Sidebar';
import { User } from 'lucide-react';
import AvailableDrivers from '../components/AvailableDrivers';
import RideBookingForm from '../components/RideBookingForm';
import RiderOverview from '../components/RiderOverview';
import { Rider } from '../types/rider';

const { Header, Content } = Layout;

type DashboardView = 'overview' | 'rides' | 'schedule' | 'messages' | 'settings';

export default function RiderPortal() {
  const { user, rider: authRider, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [rider, setRider] = useState<Rider | null>(null);
  const [userInitials, setUserInitials] = useState('');

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <RiderOverview rider={rider} />;
      case 'rides':
      case 'schedule':
      case 'messages':
      case 'settings':
        return <div className="text-white p-4">This feature is coming soon!</div>;
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
    <Layout className="min-h-screen">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userType="rider"
      />
      <Layout className="ml-64">
        <Header className="bg-zinc-900 p-4 flex justify-between items-center">
          <h1 className="text-white text-xl">Rider Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Avatar 
              className="bg-[#C69249]"
              icon={userInitials ? null : <User />}
            >
              {userInitials}
            </Avatar>
          </div>
        </Header>
        <Content className="p-6 bg-zinc-900">
          {renderCurrentView()}
          <div className="mt-8">
            <h2 className="text-white text-xl mb-4">Available Drivers</h2>
            <AvailableDrivers />
          </div>
          <div className="mt-8">
            <h2 className="text-white text-xl mb-4">Book a Ride</h2>
            <RideBookingForm />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
