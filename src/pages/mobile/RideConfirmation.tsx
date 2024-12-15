import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RideConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Ride Request Received!</h1>
        
        <p className="text-zinc-400">
          Thank you for choosing our service. We'll confirm your ride shortly.
        </p>

        <div className="bg-zinc-900 rounded-lg p-6 mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Create an Account</h2>
          <p className="text-sm text-zinc-400">
            Sign up now to enjoy these benefits:
          </p>
          <ul className="text-sm text-zinc-400 space-y-2 text-left list-disc list-inside">
            <li>Quick booking with saved addresses</li>
            <li>Real-time ride status updates</li>
            <li>Exclusive discounts and offers</li>
            <li>24/7 priority support</li>
          </ul>
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-[#C69249] text-white rounded-lg py-3 font-medium hover:bg-[#B58239] transition-colors"
          >
            Sign Up Now
          </button>
        </div>

        <div className="space-y-3 pt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-zinc-800 text-white rounded-lg py-3 font-medium hover:bg-zinc-700 transition-colors"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => navigate('/rides')}
            className="w-full text-zinc-400 py-2 hover:text-white transition-colors"
          >
            View All Rides
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideConfirmation;
