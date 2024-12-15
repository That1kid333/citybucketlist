import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Ride Completed!
        </h1>
        
        <p className="text-zinc-400 mb-8">
          Thank you for using our service. Your ride has been completed successfully.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/driver/portal/overview')}
            className="w-full bg-[#C69249] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#B58239] transition-colors"
          >
            Return to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/driver/portal/rides')}
            className="w-full bg-zinc-800 text-zinc-300 py-3 px-6 rounded-lg font-semibold hover:bg-zinc-700 transition-colors"
          >
            View All Rides
          </button>
        </div>
      </div>
    </div>
  );
}
