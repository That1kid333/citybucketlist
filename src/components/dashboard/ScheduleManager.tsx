import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { useAuth } from '../../providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  userId: string;
}

export function ScheduleManager() {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id' | 'userId'>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      loadTimeSlots();
    }
  }, [user?.uid]);

  const loadTimeSlots = async () => {
    try {
      setIsLoading(true);
      const timeSlotsRef = collection(db, 'timeSlots');
      const q = query(timeSlotsRef, where('userId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      
      const slots: TimeSlot[] = [];
      querySnapshot.forEach((doc) => {
        slots.push({ id: doc.id, ...doc.data() } as TimeSlot);
      });
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error('Failed to load your schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date()), i);
    return format(date, 'EEEE');
  });

  const handleAddSlot = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to manage your schedule');
      return;
    }

    try {
      const timeSlotRef = doc(collection(db, 'timeSlots'));
      const newTimeSlot: TimeSlot = {
        id: timeSlotRef.id,
        ...newSlot,
        userId: user.uid
      };

      await setDoc(timeSlotRef, {
        ...newSlot,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      
      setAvailableSlots(prev => [...prev, newTimeSlot]);
      toast.success('Time slot added successfully');
      
      setShowAddSlot(false);
      setNewSlot({
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00'
      });
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast.error('Failed to add time slot. Please try again.');
    }
  };

  const handleRemoveSlot = async (id: string) => {
    if (!user?.uid) {
      toast.error('Please sign in to manage your schedule');
      return;
    }

    try {
      const timeSlotRef = doc(db, 'timeSlots', id);
      await deleteDoc(timeSlotRef);
      setAvailableSlots(prev => prev.filter(slot => slot.id !== id));
      toast.success('Time slot removed successfully');
    } catch (error) {
      console.error('Error removing time slot:', error);
      toast.error('Failed to remove time slot. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Calendar View */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Weekly Schedule</h2>
          <button
            onClick={() => setShowAddSlot(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Time Slot
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center">
                <div className="font-medium mb-2">{day}</div>
                <div className="bg-neutral-800 rounded-lg p-3 min-h-[100px]">
                  {availableSlots
                    .filter(slot => slot.day === day)
                    .map(slot => (
                      <div
                        key={slot.id}
                        className="bg-[#F5A623]/10 text-[#F5A623] rounded p-2 mb-2 text-sm group hover:bg-[#F5A623]/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span>{format(parseISO(`2000-01-01T${slot.startTime}`), 'h:mm a')}</span>
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div>{format(parseISO(`2000-01-01T${slot.endTime}`), 'h:mm a')}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Time Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Time Slot</h3>
              <button
                onClick={() => setShowAddSlot(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Day
                </label>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2"
                >
                  {weekDays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <button
                onClick={handleAddSlot}
                className="w-full py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
              >
                Add Time Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}