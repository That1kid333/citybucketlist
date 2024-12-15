import { Header } from '../components/Header';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Clock, Star, UserPlus } from 'lucide-react';

export function ThankYouPage() {
  const location = useLocation();
  const bookingDetails = location.state?.booking;

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-[#F5A623] mx-auto mb-4" />,
      title: "Verified Drivers",
      description: "Access our network of thoroughly vetted and professional drivers"
    },
    {
      icon: <Clock className="w-8 h-8 text-[#F5A623] mx-auto mb-4" />,
      title: "Priority Booking",
      description: "Get priority access to schedule rides and preferred drivers"
    },
    {
      icon: <Star className="w-8 h-8 text-[#F5A623] mx-auto mb-4" />,
      title: "Loyalty Rewards",
      description: "Earn points for every ride and unlock exclusive benefits"
    },
    {
      icon: <UserPlus className="w-8 h-8 text-[#F5A623] mx-auto mb-4" />,
      title: "Personal Profile",
      description: "Save your preferences and booking history for faster service"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#F5A623] mb-4">Thank You!</h1>
          {bookingDetails ? (
            <>
              <p className="text-xl text-neutral-300 mb-4">
                Your ride has been successfully booked.
              </p>
              <p className="text-neutral-400 mb-8">
                We'll send you confirmation details shortly.
              </p>
            </>
          ) : (
            <p className="text-xl text-neutral-300 mb-8">
              Your request has been received.
            </p>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white text-center mb-12">
            Create an Account to Unlock These Benefits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-neutral-900 p-6 rounded-lg text-center hover:bg-neutral-800 transition-colors"
              >
                {benefit.icon}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-neutral-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Link
              to="/rider/signup"
              className="inline-block px-8 py-3 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
            >
              Sign Up Now
            </Link>
            <p className="text-neutral-400">
              Already have an account?{' '}
              <Link to="/rider/login" className="text-[#F5A623] hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}