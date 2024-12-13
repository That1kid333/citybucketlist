import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Dropdown, Avatar } from 'antd';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Users,
  Settings,
  LogOut,
  Menu as MenuIcon,
  Car
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

interface SidebarItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface Props {
  userType?: 'driver' | 'rider';
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function Sidebar({ userType: propUserType, currentView, onViewChange }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { driver, rider, signOut } = useAuth();
  const [mobileView, setMobileView] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setMobileView(isMobile);
      if (!isMobile) {
        setIsOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items: SidebarItem[] = [
    { to: '/', label: 'Overview', icon: <Home className="w-6 h-6" /> },
    { to: '/rides', label: 'Rides', icon: <Car className="w-6 h-6" /> },
    { to: '/schedule', label: 'Schedule', icon: <Calendar className="w-6 h-6" /> },
    { to: '/messages', label: 'Messages', icon: <MessageSquare className="w-6 h-6" /> },
    { to: '/manage-riders', label: 'Manage Riders', icon: <Users className="w-6 h-6" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> }
  ];

  const handleClick = (path: string) => {
    if (mobileView) {
      setIsOpen(false);
    }
    if (onViewChange) {
      const view = path.split('/').pop() || 'overview';
      onViewChange(view);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={signOut}>
        <div className="flex items-center text-red-500">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </div>
      </Menu.Item>
    </Menu>
  );

  // Only render for desktop
  if (mobileView) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-zinc-800">
          <img
            src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
            alt="CityBucketList.com"
            className="h-8 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => handleClick(item.to)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors
                ${location.pathname === item.to
                  ? 'bg-[#C69249] text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Dropdown overlay={userMenu} trigger={['click']} placement="topRight">
            <div className="flex items-center cursor-pointer">
              <Avatar className="bg-zinc-700" />
              <div className="ml-3">
                <div className="text-sm font-medium text-white">
                  {rider?.firstName} {rider?.lastName}
                </div>
                <div className="text-xs text-zinc-400">{rider?.email}</div>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </aside>
  );
}
