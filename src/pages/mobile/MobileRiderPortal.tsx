import { useState } from 'react';
import { MobileNavigation } from '../../components/mobile/MobileNavigation';
import { useAuth } from '../../hooks/useAuth';
import { useRiderProfile } from '../../hooks/useRiderProfile';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export function MobileRiderPortal() {
  const { user, signOut } = useAuth();
  const { riderProfile } = useRiderProfile(user?.uid);
  const [currentView, setCurrentView] = useState('Dashboard');

  const stats = [
    { label: 'Rides Taken', value: riderProfile?.totalRides || 0, icon: <MapPin className="w-5 h-5" /> },
    { label: 'Upcoming', value: riderProfile?.upcomingRides || 0, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Messages', value: riderProfile?.unreadMessages || 0, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Recent', value: riderProfile?.recentRides || 0, icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <MobileNavigation
        userType="rider"
        currentView={currentView}
        userName={user?.displayName || ''}
        userPhoto={user?.photoURL || ''}
        notificationCount={riderProfile?.notifications?.length || 0}
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
            Hello, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-neutral-400">
            Ready to explore the city?
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
            variant="primary"
            className="w-full justify-start text-left bg-[#C69249] hover:bg-[#B58239]"
            onClick={() => setCurrentView('Book')}
          >
            <MapPin className="w-5 h-5 mr-3" />
            Book a Ride
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setCurrentView('Schedule')}
          >
            <Calendar className="w-5 h-5 mr-3" />
            View Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
