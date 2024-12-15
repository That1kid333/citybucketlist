import React from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileDrawer } from './MobileDrawer';
import { Home, Car, Calendar, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileNavigationProps {
  userType: string;
  currentView: string;
  userName?: string;
  userPhoto?: string;
  notificationCount?: number;
  onSignOut: () => void;
  children?: React.ReactNode;
}

export function MobileNavigation({
  userType,
  currentView,
  userName,
  userPhoto,
  notificationCount,
  onSignOut,
  children
}: MobileNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  const driverMenuItems = [
    { path: '/driver/portal/overview', label: 'Overview', icon: <Home className="w-6 h-6" /> },
    { path: '/driver/portal/rides', label: 'Rides', icon: <Car className="w-6 h-6" /> },
    { path: '/driver/portal/schedule', label: 'Schedule', icon: <Calendar className="w-6 h-6" /> },
    { path: '/driver/portal/messages', label: 'Messages', icon: <MessageSquare className="w-6 h-6" /> },
    { path: '/driver/portal/settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> }
  ];

  const riderMenuItems = [
    { path: '/rider/portal/overview', label: 'Overview', icon: <Home className="w-6 h-6" /> },
    { path: '/rider/portal/rides', label: 'My Rides', icon: <Car className="w-6 h-6" /> },
    { path: '/rider/portal/schedule', label: 'Schedule', icon: <Calendar className="w-6 h-6" /> },
    { path: '/rider/portal/messages', label: 'Messages', icon: <MessageSquare className="w-6 h-6" /> },
    { path: '/rider/portal/settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> }
  ];

  const menuItems = userType === 'driver' ? driverMenuItems : riderMenuItems;

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  return (
    <div className="md:hidden">
      <MobileHeader
        userName={userName}
        userPhoto={userPhoto}
        notificationCount={notificationCount}
        onSignOut={onSignOut}
        onMenuClick={handleDrawerToggle}
      />
      <MobileBottomNav
        userType={userType}
        currentView={currentView}
        onMenuClick={handleDrawerToggle}
      />
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerToggle}
        menuItems={menuItems}
        onMenuItemClick={handleMenuItemClick}
        onSignOut={onSignOut}
        userName={userName}
        userPhoto={userPhoto}
        userType={userType}
      />
      <div className="flex-1 overflow-y-auto pt-16 pb-20">
        {children}
      </div>
    </div>
  );
}
