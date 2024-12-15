import { useState } from 'react';
import { MobileNavigation } from '../../components/mobile/MobileNavigation';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MapPin, Calendar, Clock, Search, MessageSquare, Star } from 'lucide-react';
import { Calendar as CalendarComponent } from '../../components/ui/Calendar';
import { useDrivers } from '../../hooks/useDrivers';
import { useRideRequests } from '../../hooks/useRideRequests';
import { Logo } from '../../components/ui/Logo';

interface Driver {
  id: string;
  name: string;
  photo?: string;
  rating: number;
  totalRides: number;
  available: boolean;
}

interface RideRequest {
  riderId: string;
  driverId: string;
  pickup: string;
  dropoff: string;
  date: Date;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export function MobileBookRide() {
  const { user, signOut } = useAuth();
  const { drivers } = useDrivers();
  const { createRideRequest } = useRideRequests();
  const [currentView, setCurrentView] = useState('Book');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleBookRide = async () => {
    if (!selectedDriver || !pickup || !dropoff || !selectedTime) {
      return;
    }

    const rideRequest: RideRequest = {
      riderId: user?.uid || '',
      driverId: selectedDriver.id,
      pickup,
      dropoff,
      date: selectedDate,
      time: selectedTime,
      status: 'pending'
    };

    await createRideRequest(rideRequest);
    // Navigate to chat with driver
    setCurrentView('Messages');
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <MobileNavigation
        userType="rider"
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

        {/* Booking Form */}
        <Card className="p-4 bg-neutral-900 border-neutral-800 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Book a Ride</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Dropoff Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Enter dropoff location"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCalendar(true)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {selectedDate.toLocaleDateString()}
              </Button>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Card className="p-4 bg-neutral-900 border-neutral-800 w-[90%] max-w-md">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }
                }}
                className="rounded-md border border-neutral-800"
              />
            </Card>
          </div>
        )}

        {/* Available Drivers */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            Choose Your Driver
          </h2>
          {drivers?.map((driver) => (
            <Card
              key={driver.id}
              className={`p-4 bg-neutral-900 border-neutral-800 ${
                selectedDriver?.id === driver.id ? 'border-[#C69249]' : ''
              }`}
              onClick={() => setSelectedDriver(driver)}
            >
              <div className="flex items-center gap-4">
                {driver.photo ? (
                  <img
                    src={driver.photo}
                    alt={driver.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Search className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{driver.name}</h3>
                    <div className="flex items-center text-[#C69249]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{driver.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400">
                    {driver.totalRides} rides completed
                  </p>
                </div>
              </div>
              {selectedDriver?.id === driver.id && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setCurrentView('Messages')}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Message Driver
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Book Button */}
        <Button
          variant="primary"
          className="w-full mt-6 bg-[#C69249] hover:bg-[#B58239]"
          onClick={handleBookRide}
          disabled={!selectedDriver || !pickup || !dropoff || !selectedTime}
        >
          Book Ride
        </Button>
      </div>
    </div>
  );
}
