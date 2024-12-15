import React from 'react';
import { 
  Clock, 
  Car, 
  Star, 
  Timer,
  Calendar,
  BellRing,
  MapPin
} from 'lucide-react';
import { Driver } from '../../types/driver';

interface OverviewProps {
  driver: Driver;
}

export default function Overview({ driver }: OverviewProps) {
  const stats = [
    {
      icon: <Clock className="w-8 h-8 text-[#C69249]" />,
      label: "Total Hours",
      value: driver.totalHours || "0"
    },
    {
      icon: <Car className="w-8 h-8 text-[#C69249]" />,
      label: "Total Rides",
      value: driver.totalRides || "0"
    },
    {
      icon: <Star className="w-8 h-8 text-[#C69249]" />,
      label: "Rating",
      value: `${driver.rating || "5.0"}⭐`
    },
    {
      icon: <Timer className="w-8 h-8 text-[#C69249]" />,
      label: "Response Time",
      value: driver.responseTime || "N/A"
    }
  ];

  const upcomingRides = driver.upcomingRides || [];
  const recentNotifications = driver.notifications || [];

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#C69249] mb-6">Dashboard Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-neutral-900 p-4 sm:p-6 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                {stat.icon}
                <span className="text-lg sm:text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-sm sm:text-base text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Upcoming Rides */}
        <div className="bg-neutral-900 p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#C69249]" />
            <h3 className="text-lg font-semibold text-white">Upcoming Rides</h3>
          </div>
          
          {upcomingRides.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {upcomingRides.map((ride, index) => (
                <div key={index} className="bg-neutral-800 p-3 sm:p-4 rounded-lg">
                  <p className="text-white font-medium mb-1">{ride.customerName}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {ride.scheduledTime}
                    </p>
                    <p className="text-sm text-neutral-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {ride.pickup} → {ride.dropoff}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400">No upcoming rides scheduled</p>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-neutral-900 p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="w-5 h-5 text-[#C69249]" />
            <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
          </div>
          
          {recentNotifications.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentNotifications.map((notification, index) => (
                <div key={index} className="bg-neutral-800 p-3 sm:p-4 rounded-lg">
                  <p className="text-white text-sm sm:text-base mb-1">{notification.message}</p>
                  <p className="text-xs sm:text-sm text-neutral-400">{notification.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400">No new notifications</p>
          )}
        </div>
      </div>
    </div>
  );
}