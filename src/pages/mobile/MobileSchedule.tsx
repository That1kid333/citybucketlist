import { useState } from 'react';
import { MobileNavigation } from '../../components/mobile/MobileNavigation';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Calendar } from '../../components/ui/Calendar';
import { Logo } from '../../components/ui/Logo';

interface Ride {
  id: string;
  date: Date;
  time: string;
  pickup: string;
  dropoff: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export function MobileSchedule() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('Schedule');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock data - replace with actual data from your backend
  const rides: Ride[] = [
    {
      id: '1',
      date: new Date(),
      time: '10:00 AM',
      pickup: '123 Main St',
      dropoff: '456 Market St',
      status: 'upcoming',
    },
    {
      id: '2',
      date: new Date(),
      time: '2:00 PM',
      pickup: '789 Park Ave',
      dropoff: '321 Lake St',
      status: 'upcoming',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <MobileNavigation
        userType={user?.role || 'rider'}
        currentView={currentView}
        userName={user?.displayName || ''}
        userPhoto={user?.photoURL || ''}
        onSignOut={signOut}
      />

      <div className="px-4 py-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Calendar */}
        <Card className="mb-6 p-4 bg-neutral-900 border-neutral-800">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border border-neutral-800"
          />
        </Card>

        {/* Rides List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            Scheduled Rides
          </h2>
          {rides.map((ride) => (
            <Card
              key={ride.id}
              className="p-4 bg-neutral-900 border-neutral-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#C69249]">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">
                    {ride.date.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{ride.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-400">Pickup</p>
                    <p className="text-white">{ride.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-400">Dropoff</p>
                    <p className="text-white">{ride.dropoff}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
