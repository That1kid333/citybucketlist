import { useAuth } from '../../providers/AuthProvider';
import {
  Home as HomeIcon,
  Car as CarIcon,
  Calendar as CalendarIcon,
  MessageCircle as MessageCircleIcon,
  Settings as SettingsIcon,
  Users,
  LogOut as LogOutIcon
} from 'lucide-react';

type DashboardView = 'overview' | 'rides' | 'schedule' | 'messages' | 'manage-riders' | 'settings';

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userType: 'driver' | 'rider';
}

export function Sidebar({ currentView, onViewChange, userType }: SidebarProps) {
  const { signOut } = useAuth();

  const driverNavItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'rides', label: 'Rides', icon: CarIcon },
    { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
    { id: 'messages', label: 'Messages', icon: MessageCircleIcon },
    { id: 'manage-riders', label: 'Manage Riders', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const riderNavItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'rides', label: 'Rides', icon: CarIcon },
    { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
    { id: 'messages', label: 'Messages', icon: MessageCircleIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const navItems = userType === 'driver' ? driverNavItems : riderNavItems;

  return (
    <div className="w-64 bg-zinc-900 min-h-screen p-4">
      <div className="p-4">
        <img 
          src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
          alt="CityBucketList.com"
          className="h-8 object-contain mb-8"
        />
      </div>
      <nav className="space-y-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id as DashboardView)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              currentView === id
                ? 'bg-[#C69249] text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
        
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors mt-8"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
}