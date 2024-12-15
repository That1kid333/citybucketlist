import { useNavigate } from 'react-router-dom';
import { Settings, CreditCard, LogOut, X, User } from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'driver' | 'rider';
  menuItems: MenuItem[];
  onMenuItemClick: (path: string) => void;
  onSignOut: () => void;
  userName?: string;
  userPhoto?: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  userType,
  menuItems,
  onMenuItemClick,
  onSignOut,
  userName,
  userPhoto,
}: MobileDrawerProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleMenuItemClick = (path: string) => {
    onMenuItemClick(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-64 bg-neutral-900 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                <User className="w-6 h-6 text-neutral-400" />
              </div>
            )}
            <div>
              <div className="font-medium text-white">{userName || 'User'}</div>
              <div className="text-sm text-neutral-400 capitalize">{userType}</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-16">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sign Out Button */}
          <div className="mt-8 px-4">
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
