import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import {
  Home as HomeIcon,
  Car as CarIcon,
  Calendar as CalendarIcon,
  MessageCircle as MessageCircleIcon,
  Settings as SettingsIcon,
  Users,
  LogOut as LogOutIcon,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  driver: any;
  isOnline: boolean;
  onToggleOnline: (status: boolean) => void;
  onSignOut: () => void;
}

export function Sidebar({ driver, isOnline, onToggleOnline, onSignOut }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: HomeIcon, path: '/driver/portal/overview' },
    { id: 'rides', label: 'Rides', icon: CarIcon, path: '/driver/portal/rides' },
    { id: 'schedule', label: 'Schedule', icon: CalendarIcon, path: '/driver/portal/schedule' },
    { id: 'messages', label: 'Messages', icon: MessageCircleIcon, path: '/driver/portal/messages' },
    { id: 'manage-riders', label: 'Manage Riders', icon: Users, path: '/driver/portal/manage-riders' },
    { id: 'membership', label: 'Membership', icon: CreditCard, path: '/driver/portal/membership' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/driver/portal/settings' },
  ];

  return (
    <div className="w-64 bg-zinc-900 min-h-screen p-4">
      <div className="p-4">
        <img 
          src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
          alt="CityBucketList.com"
          className="h-8 object-contain mb-8"
        />
      </div>

      {/* Online/Offline Toggle */}
      <div className="px-4 mb-6">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isOnline}
            onChange={(e) => onToggleOnline(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C69249]"></div>
          <span className="ml-3 text-sm font-medium text-white">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </label>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-[#C69249] text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </Link>
        ))}

        <button
          onClick={onSignOut}
          className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LogOutIcon className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </nav>
    </div>
  );
}