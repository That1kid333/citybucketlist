import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface SavedRider {
  id: string;
  name: string;
  phone: string;
  pickupAddress?: string;
  dropoffAddress?: string;
}

interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  riderId: string;
  riderName: string;
  pickup?: string;
  dropoff?: string;
}

interface ScheduleManagerProps {
  driver: any;
}

export function ScheduleManager({ driver }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedRider, setSelectedRider] = useState('');
  const [savedRiders, setSavedRiders] = useState<SavedRider[]>([]);
  const { user } = useAuth();

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  useEffect(() => {
    if (user?.uid) {
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
    }
  };

  const handleAddSchedule = () => {
    if (!selectedDay || !startTime || !endTime || !selectedRider) {
      return;
    }

    const rider = savedRiders.find(r => r.id === selectedRider);
    if (!rider) return;

    setSchedules([
      ...schedules,
      {
        day: selectedDay,
        startTime,
        endTime,
        riderId: rider.id,
        riderName: rider.name,
        pickup: rider.pickupAddress,
        dropoff: rider.dropoffAddress,
      },
    ]);

    // Reset form
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
    setSelectedRider('');
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Schedule Manager</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Rider</label>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
            >
              <option value="">Select a rider</option>
              {savedRiders.map((rider) => (
                <option key={rider.id} value={rider.id}>
                  {rider.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
            >
              <option value="">Select a day</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
            />
          </div>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Current Schedule</h3>
          {schedules.length === 0 ? (
            <p className="text-zinc-400">No schedules set</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((schedule, index) => (
                <div
                  key={`${schedule.day}-${index}`}
                  className="flex items-center justify-between bg-zinc-700 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white capitalize">{schedule.day}</p>
                    <p className="text-sm text-zinc-400">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                    <p className="text-sm text-zinc-400">Rider: {schedule.riderName}</p>
                    {schedule.pickup && (
                      <p className="text-xs text-zinc-500">From: {schedule.pickup}</p>
                    )}
                    {schedule.dropoff && (
                      <p className="text-xs text-zinc-500">To: {schedule.dropoff}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveSchedule(index)}
                    className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-zinc-600"
                  >
                    <span className="sr-only">Remove</span>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleAddSchedule}
        disabled={!selectedDay || !startTime || !endTime || !selectedRider}
        className="bg-[#C69249] text-white px-6 py-2 rounded-lg hover:bg-[#B58239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Schedule
      </button>
    </div>
  );
}