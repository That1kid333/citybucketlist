import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, MapPin, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { DatePicker, TimePicker, Input, Modal, Select } from 'antd';
import type { Dayjs } from 'dayjs';

interface SavedRider {
  id: string;
  name: string;
  email: string;
}

interface ScheduledRide {
  id: string;
  driverId: string;
  riderId: string;
  riderName: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export function DriverSchedule() {
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>([]);
  const [savedRiders, setSavedRiders] = useState<SavedRider[]>([]);
  const [showAddRide, setShowAddRide] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRide, setNewRide] = useState<Omit<ScheduledRide, 'id' | 'driverId' | 'status' | 'riderName'>>({
    riderId: '',
    date: '',
    time: '',
    pickup: '',
    dropoff: '',
    notes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      loadScheduledRides();
      loadSavedRiders();
    }
  }, [user?.uid]);

  const loadSavedRiders = async () => {
    try {
      const ridersRef = collection(db, 'drivers', user!.uid, 'savedRiders');
      const querySnapshot = await getDocs(ridersRef);
      
      const riders: SavedRider[] = [];
      querySnapshot.forEach((doc) => {
        riders.push({ id: doc.id, ...doc.data() } as SavedRider);
      });
      
      setSavedRiders(riders);
    } catch (error) {
      console.error('Error loading saved riders:', error);
      toast.error('Failed to load your saved riders');
    }
  };

  const loadScheduledRides = async () => {
    try {
      setIsLoading(true);
      const ridesRef = collection(db, 'scheduledRides');
      const q = query(ridesRef, where('driverId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      
      const rides: ScheduledRide[] = [];
      querySnapshot.forEach((doc) => {
        rides.push({ id: doc.id, ...doc.data() } as ScheduledRide);
      });
      
      setScheduledRides(rides.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error loading scheduled rides:', error);
      toast.error('Failed to load your scheduled rides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRide = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to schedule a ride');
      return;
    }

    if (!newRide.riderId || !newRide.date || !newRide.time || !newRide.pickup || !newRide.dropoff) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedRider = savedRiders.find(rider => rider.id === newRide.riderId);
    if (!selectedRider) {
      toast.error('Please select a valid rider');
      return;
    }

    try {
      const rideRef = doc(collection(db, 'scheduledRides'));
      const newScheduledRide: ScheduledRide = {
        id: rideRef.id,
        driverId: user.uid,
        riderName: selectedRider.name,
        ...newRide,
        status: 'pending'
      };

      await setDoc(rideRef, {
        driverId: user.uid,
        riderName: selectedRider.name,
        ...newRide,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      setScheduledRides(prev => [...prev, newScheduledRide].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      toast.success('Ride scheduled successfully');
      
      setShowAddRide(false);
      setNewRide({
        riderId: '',
        date: '',
        time: '',
        pickup: '',
        dropoff: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error scheduling ride:', error);
      toast.error('Failed to schedule ride. Please try again.');
    }
  };

  const handleUpdateStatus = async (rideId: string, newStatus: ScheduledRide['status']) => {
    try {
      const rideRef = doc(db, 'scheduledRides', rideId);
      await setDoc(rideRef, { status: newStatus }, { merge: true });
      
      setScheduledRides(prev => prev.map(ride => 
        ride.id === rideId ? { ...ride, status: newStatus } : ride
      ));
      
      toast.success(`Ride ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Failed to update ride status');
    }
  };

  const handleCancelRide = async (id: string) => {
    if (!user?.uid) {
      toast.error('Please sign in to manage scheduled rides');
      return;
    }

    try {
      const rideRef = doc(db, 'scheduledRides', id);
      await deleteDoc(rideRef);
      setScheduledRides(prev => prev.filter(ride => ride.id !== id));
      toast.success('Ride cancelled successfully');
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error('Failed to cancel ride. Please try again.');
    }
  };

  const getStatusColor = (status: ScheduledRide['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500 bg-green-500/10';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10';
      case 'completed':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#C69249]">Schedule</h2>
        <button
          onClick={() => setShowAddRide(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule New Ride
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C69249]" />
        </div>
      ) : scheduledRides.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg p-6 sm:p-8 text-center">
          <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Scheduled Rides</h3>
          <p className="text-zinc-400">
            You haven't scheduled any rides yet. Click the button above to schedule your first ride.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scheduledRides.map((ride) => (
            <div
              key={ride.id}
              className="bg-zinc-900 rounded-lg p-4 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#C69249]">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(ride.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    <span>{ride.time}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleUpdateStatus(ride.id, 'confirmed')}
                    className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleCancelRide(ride.id)}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 mt-1">
                    <MapPin className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Pickup</p>
                    <p className="text-white">{ride.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 mt-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Dropoff</p>
                    <p className="text-white">{ride.dropoff}</p>
                  </div>
                </div>
                {ride.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 mt-1">
                      <FileText className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Notes</p>
                      <p className="text-white">{ride.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C69249]" />
                  <span className="text-white">{ride.riderName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddRide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-lg">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Schedule New Ride</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Rider</label>
                <select
                  value={newRide.riderId}
                  onChange={(e) => setNewRide({ ...newRide, riderId: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                >
                  <option value="">Select a rider</option>
                  {savedRiders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newRide.date}
                    onChange={(e) => setNewRide({ ...newRide, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={newRide.time}
                    onChange={(e) => setNewRide({ ...newRide, time: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={newRide.pickup}
                  onChange={(e) => setNewRide({ ...newRide, pickup: e.target.value })}
                  placeholder="Enter pickup address"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Dropoff Location</label>
                <input
                  type="text"
                  value={newRide.dropoff}
                  onChange={(e) => setNewRide({ ...newRide, dropoff: e.target.value })}
                  placeholder="Enter dropoff address"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Notes (Optional)</label>
                <textarea
                  value={newRide.notes}
                  onChange={(e) => setNewRide({ ...newRide, notes: e.target.value })}
                  placeholder="Add any special instructions"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowAddRide(false)}
                className="w-full sm:w-auto px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRide}
                className="w-full sm:w-auto px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
              >
                Schedule Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
