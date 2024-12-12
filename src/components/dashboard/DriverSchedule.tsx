import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
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
                  <div className="text-lg font-medium">{ride.riderName}</div>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(ride.id, 'confirmed')}
                    className="text-green-500 hover:text-green-400 text-sm"
                  >
                    Confirm Ride
                  </button>
                  <button
                    onClick={() => handleCancelRide(ride.id)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Cancel Ride
                  </button>
                </div>
              )}
              {ride.status === 'confirmed' && (
                <button
                  onClick={() => handleUpdateStatus(ride.id, 'completed')}
                  className="text-blue-500 hover:text-blue-400 text-sm"
                >
                  Mark as Completed
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
            <label className="block text-sm font-medium mb-1">Rider</label>
            <Select
              className="w-full"
              placeholder="Select a rider"
              value={newRide.riderId}
              onChange={(value) => setNewRide(prev => ({ ...prev, riderId: value }))}
            >
              {savedRiders.map(rider => (
                <Select.Option key={rider.id} value={rider.id}>
                  {rider.name}
                </Select.Option>
              ))}
            </Select>
          </div>

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
