import { useState } from 'react';
import { MobileNavigation } from '../../components/mobile/MobileNavigation';
import { useAuth } from '../../hooks/useAuth';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Car, Calendar, MessageSquare, DollarSign } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export function MobileDriverPortal() {
  const { user, signOut } = useAuth();
  const { driverProfile } = useDriverProfile(user?.uid);
  const [currentView, setCurrentView] = useState('Dashboard');

  const stats = [
    { label: 'Total Rides', value: driverProfile?.totalRides || 0, icon: <Car className="w-5 h-5" /> },
    { label: 'Upcoming', value: driverProfile?.upcomingRides || 0, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Messages', value: driverProfile?.unreadMessages || 0, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Earnings', value: `$${driverProfile?.earnings || 0}`, icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <MobileNavigation
        userType="driver"
        currentView={currentView}
        userName={user?.displayName || ''}
        userPhoto={user?.photoURL || ''}
        notificationCount={driverProfile?.notifications?.length || 0}
        onSignOut={signOut}
      />

      <div className="px-4 py-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-neutral-400">
            You have {driverProfile?.upcomingRides || 0} upcoming rides today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 bg-neutral-900 border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-[#C69249]">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-neutral-400">{stat.label}</p>
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setCurrentView('Schedule')}
          >
            <Calendar className="w-5 h-5 mr-3" />
            View Schedule
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setCurrentView('Messages')}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Check Messages
          </Button>
        </div>
      </div>
    </div>
  );
}
