import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Car, Calendar, MessageSquare, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  userType: 'driver' | 'rider';
  currentView: string;
  onMenuClick: () => void;
}

export function MobileBottomNav({
  userType,
  currentView,
  onMenuClick,
}: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: <Home className="w-6 h-6" />,
      label: 'Overview',
      path: `/${userType}/portal/overview`,
    },
    {
      icon: <Car className="w-6 h-6" />,
      label: userType === 'driver' ? 'Rides' : 'My Rides',
      path: `/${userType}/portal/rides`,
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Schedule',
      path: `/${userType}/portal/schedule`,
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'Messages',
      path: `/${userType}/portal/messages`,
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: 'Settings',
      path: `/${userType}/portal/settings`,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-40">
      <div className="flex justify-between items-center px-4">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center gap-1 py-3 px-2 min-w-[64px] ${
                isActive ? 'text-[#C69249]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
