import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { useAuth } from '../../providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { DatePicker, TimePicker, Input, Modal } from 'antd';
import type { Dayjs } from 'dayjs';

interface ScheduledRide {
  id: string;
  riderId: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export function RiderSchedule() {
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>([]);
  const [showAddRide, setShowAddRide] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRide, setNewRide] = useState<Omit<ScheduledRide, 'id' | 'riderId' | 'status'>>({
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
    }
  }, [user?.uid]);

  const loadScheduledRides = async () => {
    try {
      setIsLoading(true);
      const ridesRef = collection(db, 'scheduledRides');
      const q = query(ridesRef, where('riderId', '==', user?.uid));
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

    if (!newRide.date || !newRide.time || !newRide.pickup || !newRide.dropoff) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const rideRef = doc(collection(db, 'scheduledRides'));
      const newScheduledRide: ScheduledRide = {
        id: rideRef.id,
        riderId: user.uid,
        ...newRide,
        status: 'pending'
      };

      await setDoc(rideRef, {
        riderId: user.uid,
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

  const handleCancelRide = async (id: string) => {
    if (!user?.uid) {
      toast.error('Please sign in to manage your scheduled rides');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scheduled Rides</h2>
        <button
          onClick={() => setShowAddRide(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
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
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
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
              className="bg-zinc-900 rounded-lg p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C69249]" />
                    <span>{format(new Date(ride.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C69249]" />
                    <span>{ride.time}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(ride.status)}`}>
                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-sm text-zinc-400">Pickup Location</div>
                  <div>{ride.pickup}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Drop-off Location</div>
                  <div>{ride.dropoff}</div>
                </div>
                {ride.notes && (
                  <div>
                    <div className="text-sm text-zinc-400">Notes</div>
                    <div className="text-sm">{ride.notes}</div>
                  </div>
                )}
              </div>

              {ride.status === 'pending' && (
                <button
                  onClick={() => handleCancelRide(ride.id)}
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        title="Schedule a Ride"
        open={showAddRide}
        onOk={handleAddRide}
        onCancel={() => setShowAddRide(false)}
        okText="Schedule"
        cancelText="Cancel"
        okButtonProps={{
          className: 'bg-[#C69249] hover:bg-[#B58239] border-none',
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <DatePicker
              className="w-full"
              onChange={(date: Dayjs | null) => 
                setNewRide(prev => ({ ...prev, date: date?.toISOString() || '' }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <TimePicker
              className="w-full"
              format="HH:mm"
              onChange={(time: Dayjs | null) => 
                setNewRide(prev => ({ ...prev, time: time?.format('HH:mm') || '' }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pickup Location</label>
            <Input
              value={newRide.pickup}
              onChange={e => setNewRide(prev => ({ ...prev, pickup: e.target.value }))}
              placeholder="Enter pickup address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Drop-off Location</label>
            <Input
              value={newRide.dropoff}
              onChange={e => setNewRide(prev => ({ ...prev, dropoff: e.target.value }))}
              placeholder="Enter drop-off address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <Input.TextArea
              value={newRide.notes}
              onChange={e => setNewRide(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special instructions or notes"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
