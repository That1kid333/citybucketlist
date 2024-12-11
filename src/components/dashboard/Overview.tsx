import { useState, useEffect } from 'react';
import { 
  Clock, 
  Car, 
  Star, 
  Timer, 
  Coffee, 
  AlertTriangle, 
  HelpCircle, 
  LogOut,
  Calendar,
  BellRing
} from 'lucide-react';
import { Driver } from '../../types/driver';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface OverviewProps {
  driver: Driver;
  isOnline: boolean;
  onToggleOnline: (status: boolean) => void;
}

export function Overview({ driver, isOnline, onToggleOnline }: OverviewProps) {
  const navigate = useNavigate();
  const [isBreak, setIsBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0
  });

  useEffect(() => {
    // Simulate loading earnings data
    setEarnings({
      today: 245.50,
      week: 1234.75,
      month: 4567.80
    });
  }, []);

  useEffect(() => {
    // Load initial online status from driver data
    if (driver?.available !== undefined) {
      onToggleOnline(driver.available);
    }
  }, [driver?.available]);

  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      
      // Update Firestore first
      await updateDoc(doc(db, 'drivers', driver.id), {
        available: newStatus,
        updated_at: new Date().toISOString()
      });

      // If Firestore update succeeds, update local state
      onToggleOnline(newStatus);
      
      toast.success(newStatus ? 'You are now online and available for rides' : 'You are now offline');
    } catch (error) {
      console.error('Error toggling online status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handleToggleBreak = async () => {
    try {
      const newBreakStatus = !isBreak;
      setIsBreak(newBreakStatus);
      
      if (newBreakStatus) {
        setBreakStartTime(new Date());
      } else {
        setBreakStartTime(null);
      }

      await updateDoc(doc(db, 'drivers', driver.id), {
        onBreak: newBreakStatus,
        breakStartTime: newBreakStatus ? new Date().toISOString() : null
      });

      toast.success(newBreakStatus ? 'Break started' : 'Break ended');
    } catch (error) {
      console.error('Error updating break status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleEmergency = () => {
    // TODO: Implement emergency contact system
    toast.error('Emergency services contacted');
  };

  const handleSupport = () => {
    navigate('/support');
  };

  const handleEndShift = async () => {
    try {
      await updateDoc(doc(db, 'drivers', driver.id), {
        available: false,
        lastShiftEnd: new Date().toISOString()
      });
      
      onToggleOnline(false);

      toast.success('Shift ended successfully');
    } catch (error) {
      console.error('Error ending shift:', error);
      toast.error('Failed to end shift');
    }
  };

  return (
    <div className="space-y-6">
      {/* Driver Profile Header */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            {driver.photoURL ? (
              <img
                src={driver.photoURL}
                alt={driver.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-2xl">
                  {driver.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-neutral-900 ${
              isOnline ? 'bg-green-500' : 'bg-gray-500'
            }`} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white">{driver.name}</h2>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1">{driver.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{driver.totalRides || 0} Rides</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Hours Online</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.hoursOnline || '0'}h
          </p>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Car className="w-5 h-5" />
            <span className="text-sm font-medium">Today's Rides</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.todayRides || 0}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium">Acceptance Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.acceptanceRate || '100'}%
          </p>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-[#F5A623]">
            <Timer className="w-5 h-5" />
            <span className="text-sm font-medium">Response Time</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {driver.responseTime || '0'}s
          </p>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Earnings Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Today</p>
            <p className="text-xl font-bold text-[#F5A623]">
              ${earnings.today.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">This Week</p>
            <p className="text-xl font-bold text-[#F5A623]">
              ${earnings.week.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">This Month</p>
            <p className="text-xl font-bold text-[#F5A623]">
              ${earnings.month.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming Schedule */}
        <div className="bg-neutral-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upcoming Schedule</h3>
            <Calendar className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="space-y-3">
            {driver.schedule ? (
              driver.schedule.map((shift, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{shift.day}</span>
                  <span className="text-white">{shift.hours}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No upcoming shifts</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-neutral-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <BellRing className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="space-y-3">
            {driver.recentActivity ? (
              driver.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{activity.action}</span>
                  <span className="text-white">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}