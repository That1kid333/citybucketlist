import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { X, Settings, LogOut, Layout } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const { userType, signOut } = useAuth();

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isOpen) return null;

  const getDashboardPath = () => {
    if (!userType) return '/';
    return userType === 'driver' ? '/driver/portal/overview' : '/rider/portal/overview';
  };

  const getSettingsPath = () => {
    if (!userType) return '/';
    return userType === 'driver' ? '/driver/portal/settings' : '/rider/portal/settings';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
      <div className="flex flex-col h-full text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => handleNavigation(getDashboardPath())}
                className="flex items-center space-x-3 w-full py-2 hover:bg-gray-800 rounded-lg px-3 transition-colors"
              >
                <Layout className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation(getSettingsPath())}
                className="flex items-center space-x-3 w-full py-2 hover:bg-gray-800 rounded-lg px-3 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 w-full py-2 hover:bg-gray-800 rounded-lg px-3 transition-colors mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
