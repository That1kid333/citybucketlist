import React from 'react';
import {
  HomeIcon,
  CarIcon,
  WalletIcon,
  CalendarIcon,
  MessageSquareIcon,
  SettingsIcon,
  LogOutIcon,
  Users,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userType: 'rider' | 'driver';
}

export function Sidebar({ currentView, onViewChange, userType }: SidebarProps) {
  const { signOut } = useAuth();

  const driverNavItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'rides', label: 'Rides', icon: CarIcon },
    { id: 'earnings', label: 'Earnings', icon: WalletIcon },
    { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquareIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const riderNavItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'rides', label: 'Rides', icon: CarIcon },
    { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquareIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const navItems = userType === 'driver' ? driverNavItems : riderNavItems;

  return (
    <div className="w-64 bg-zinc-900 min-h-screen p-4">
      <nav className="space-y-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
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
        {userType === 'driver' && (
          <NavLink
            to="/driver/riders"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#C69249] text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span>Manage Riders</span>
          </NavLink>
        )}
        {userType === 'driver' && (
          <NavLink
            to="/driver/messages"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#C69249] text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`
            }
          >
            <MessageCircle className="w-5 h-5" />
            <span>Messages</span>
          </NavLink>
        )}
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