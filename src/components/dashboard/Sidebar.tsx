import React from 'react';
import { 
  LayoutDashboard, Car, DollarSign, Calendar, 
  MessageCircle, Settings, Users 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rides', label: 'Rides', icon: Car },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-neutral-900 min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === id
                ? 'bg-[#F5A623] text-white'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
        <NavLink
          to="/driver/riders"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-[#C69249] text-white'
                : 'text-gray-400 hover:bg-neutral-800 hover:text-white'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Manage Riders</span>
        </NavLink>
      </nav>
    </aside>
  );
}