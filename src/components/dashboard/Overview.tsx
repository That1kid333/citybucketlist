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
  if (!driver) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading driver information...</p>
      </div>
    );
  }

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
              className="bg-zinc-900 p-6 rounded-lg flex flex-col items-center justify-center text-center"
            >
              {stat.icon}
              <h3 className="mt-4 text-lg font-medium text-white">{stat.value}</h3>
              <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Rides */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#C69249] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Rides
            </h3>
          </div>
          <div className="space-y-4">
            {upcomingRides.length > 0 ? (
              upcomingRides.map((ride, index) => (
                <div key={index} className="flex items-start space-x-4 bg-zinc-800 p-4 rounded-lg">
                  <MapPin className="w-5 h-5 text-[#C69249] mt-1" />
                  <div>
                    <p className="font-medium">{ride.pickup} → {ride.dropoff}</p>
                    <p className="text-sm text-gray-400">{ride.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No upcoming rides</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#C69249] flex items-center gap-2">
              <BellRing className="w-5 h-5" />
              Recent Notifications
            </h3>
          </div>
          <div className="space-y-4">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-4 bg-zinc-800 p-4 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#C69249] mt-2" />
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-400">{notification.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No recent notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}