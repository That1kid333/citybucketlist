import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle } from 'lucide-react';

interface LocationState {
  rideId: string;
  driverId: string;
  driverName: string;
}

const RideRequestConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const handleMessageDriver = () => {
    navigate(`/messages/${state.driverId}`, {
      state: {
        recipientId: state.driverId,
        recipientName: state.driverName,
        rideId: state.rideId
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Ride Request Confirmed!</h1>
        
        <p className="text-zinc-400">
          Your ride request has been confirmed. Your driver {state.driverName} will be notified.
        </p>

        <div className="space-y-4 pt-6">
          <button
            onClick={handleMessageDriver}
            className="w-full flex items-center justify-center gap-2 bg-[#C69249] text-white rounded-lg py-3 font-medium hover:bg-[#B58239] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Message Driver
          </button>

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

export default RideRequestConfirmation;
