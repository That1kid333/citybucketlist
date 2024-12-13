import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Star, MapPin, Phone, Mail, Calendar, Clock, Car } from 'lucide-react';
import { Driver } from '../types/driver';
import { formatDate } from '../utils/date';

interface BookingConfirmationProps {
  booking: {
    name: string;
    phone: string;
    pickup: string;
    dropoff: string;
    locationId: string;
    driver: Driver;
    created_at: string;
  };
}

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Confirmation Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-[#C69249] text-3xl font-bold mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-neutral-400">
              Your ride request has been sent to the driver. You will receive a message
              when they confirm your ride.
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-neutral-900 rounded-lg p-6 mb-6">
            <h2 className="text-white text-xl font-semibold mb-4">Booking Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-neutral-400 text-sm mb-1">Name</div>
                  <div className="text-white">{booking.name}</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-sm mb-1">Phone</div>
                  <div className="text-white">{booking.phone}</div>
                </div>
              </div>

              <div>
                <div className="text-neutral-400 text-sm mb-1">Pickup Location</div>
                <div className="text-white">{booking.pickup}</div>
              </div>

              <div>
                <div className="text-neutral-400 text-sm mb-1">Drop-off Location</div>
                <div className="text-white">{booking.dropoff}</div>
              </div>

              <div className="flex items-center gap-2 text-neutral-400">
                <Calendar className="w-4 h-4" />
                <span>Requested on {formatDate(booking.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="bg-neutral-900 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Your Driver</h2>
            <div className="flex items-start gap-4">
              {/* Driver Photo */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                {booking.driver.photoURL ? (
                  <img
                    src={booking.driver.photoURL}
                    alt={booking.driver.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {booking.driver.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Driver Info */}
              <div className="flex-grow">
                <h3 className="text-white text-lg font-medium mb-1">
                  {booking.driver.name}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-white">
                    {booking.driver.rating?.toFixed(1) || '5.0'}
                  </span>
                </div>

                <div className="space-y-2">
                  {booking.driver.vehicle && (
                    <div className="space-y-1">
                      <div className="text-neutral-400 text-sm">
                        Vehicle: {booking.driver.vehicle.make} {booking.driver.vehicle.model} •{' '}
                        {booking.driver.vehicle.color} • {booking.driver.vehicle.year}
                      </div>
                      <div className="text-neutral-400 text-sm flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <span>License Plate: {booking.driver.vehicle.plate}</span>
                      </div>
                    </div>
                  )}
                  {booking.driver.phone && (
                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{booking.driver.phone}</span>
                    </div>
                  )}
                  {booking.driver.email && (
                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{booking.driver.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 rounded-lg bg-[#C69249] text-white hover:bg-[#B58238] transition-colors"
            >
              Print Details
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
