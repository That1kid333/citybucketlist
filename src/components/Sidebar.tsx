import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Settings, 
  DollarSign,
  Star,
  Users,
  Crown,
  Car
} from 'lucide-react';

interface SidebarItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  premium?: boolean;
}

const driverItems: SidebarItem[] = [
  { to: '/driver/portal', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/driver/schedule', icon: <Calendar className="w-5 h-5" />, label: 'Schedule' },
  { to: '/driver/messages', icon: <MessageSquare className="w-5 h-5" />, label: 'Messages' },
  { to: '/earnings', icon: <DollarSign className="w-5 h-5" />, label: 'Earnings' },
  { to: '/driver/ratings', icon: <Star className="w-5 h-5" />, label: 'Ratings' },
  { to: '/manage-riders', icon: <Users className="w-5 h-5" />, label: 'Manage Riders' },
  { 
    to: '/membership', 
    icon: <Crown className="w-5 h-5" />, 
    label: 'Membership', 
    premium: true 
  },
  { to: '/driver/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
];

const riderItems: SidebarItem[] = [
  { to: '/rider/portal', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/rider/rides', icon: <Car className="w-5 h-5" />, label: 'My Rides' },
  { to: '/rider/messages', icon: <MessageSquare className="w-5 h-5" />, label: 'Messages' },
  { 
    to: '/rider/membership', 
    icon: <Crown className="w-5 h-5" />, 
    label: 'Membership', 
    premium: true 
  },
  { to: '/rider/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
];

interface Props {
  userType?: 'driver' | 'rider';
}

export function Sidebar({ userType: propUserType }: Props) {
  const location = useLocation();
  const { driver, rider } = useAuth();
  
  // Use the provided userType from props first, then fall back to context determination
  const userType = propUserType || (driver ? 'driver' : rider ? 'rider' : undefined);
  
  // If no user type can be determined, don't render the sidebar
  if (!userType) {
    console.log('No user type determined for sidebar');
    return null;
  }

  const items = userType === 'driver' ? driverItems : riderItems;

  return (
    <div className="w-64 bg-zinc-900 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <Link to="/">
          <img 
            src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
            alt="CityBucketList.com"
            className="h-8 object-contain mb-8"
          />
        </Link>
        
        <nav className="space-y-2">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-[#C69249] text-white' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.premium && (
                  <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-[#C69249] text-white">
                    Premium
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
