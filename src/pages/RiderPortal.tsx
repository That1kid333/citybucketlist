import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Layout, Avatar, Dropdown, Menu } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Sidebar } from '../components/Sidebar';
import { User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import RiderOverview from '../components/RiderOverview';
import RideHistory from '../components/dashboard/RideHistory';
import ScheduleRides from '../components/dashboard/ScheduleRides';
import Messages from '../components/dashboard/Messages';
import { Settings } from '../components/dashboard/Settings';
import Membership from '../components/dashboard/Membership';
import AvailableDrivers from '../components/AvailableDrivers';
import RideBookingForm from '../components/RideBookingForm';
import { Rider } from '../types/rider';
import { Outlet } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Users,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  Car
} from 'lucide-react';

const { Content } = Layout;

type DashboardView = 'overview' | 'rides' | 'schedule' | 'messages' | 'settings' | 'membership';

export default function RiderPortal() {
  const { user, rider: authRider, loading, signOut } = useAuth();
  const [rider, setRider] = useState<Rider | null>(null);
  const [userInitials, setUserInitials] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split('/').pop() || 'overview';
  const [currentView, setCurrentView] = useState<DashboardView>(currentPath as DashboardView);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMobileNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        <div className="flex items-center text-red-500">
          <LogOutIcon className="w-4 h-4 mr-2" />
          Sign Out
        </div>
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    { to: '/overview', label: 'Overview', icon: <Home className="w-6 h-6" /> },
    { to: '/rides', label: 'Rides', icon: <Car className="w-6 h-6" /> },
    { to: '/schedule', label: 'Schedule', icon: <Calendar className="w-6 h-6" /> },
    { to: '/messages', label: 'Messages', icon: <MessageSquare className="w-6 h-6" /> },
    { to: '/settings', label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> }
  ];

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
        return rider ? <Settings user={rider} userType="rider" /> : null;
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
    <Layout className="min-h-screen bg-zinc-900">
      {/* Desktop Sidebar */}
      <Sidebar 
        userType="rider" 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 md:hidden">
        <div className="flex items-center justify-between p-4">
          <button
            className="p-2 rounded-lg text-white hover:bg-zinc-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <img
            src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
            alt="CityBucketList.com"
            className="h-8"
          />
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <Avatar className="bg-zinc-700 cursor-pointer" />
          </Dropdown>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-zinc-900 z-50 pt-16">
            <nav className="p-4">
              {menuItems.map((item) => (
                <button
                  key={item.to}
                  onClick={() => handleMobileNav(item.to)}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg mb-2 text-left text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Layout className="transition-all duration-300 md:ml-64">
        <Content className="min-h-screen bg-zinc-900 px-4 pt-20 pb-6 md:p-6">
          <div className="h-full max-w-7xl mx-auto">
            <Outlet />
            <div className="mt-8">
              <h2 className="text-white text-xl mb-4">Available Drivers</h2>
              <AvailableDrivers />
            </div>
            <div className="mt-8">
              <h2 className="text-white text-xl mb-4">Book a Ride</h2>
              <RideBookingForm />
            </div>
            {renderCurrentView()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
