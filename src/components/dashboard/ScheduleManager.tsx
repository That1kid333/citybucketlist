import React, { useState } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export function ScheduleManager() {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00'
    },
    {
      id: '2',
      day: 'Wednesday',
      startTime: '10:00',
      endTime: '18:00'
    }
  ]);

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id'>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date()), i);
    return format(date, 'EEEE');
  });

  const handleAddSlot = () => {
    const id = Date.now().toString();
    setAvailableSlots(prev => [...prev, { ...newSlot, id }]);
    setShowAddSlot(false);
    setNewSlot({
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00'
    });
  };

  const handleRemoveSlot = (id: string) => {
    setAvailableSlots(prev => prev.filter(slot => slot.id !== id));
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
                      className="bg-[#F5A623]/10 text-[#F5A623] rounded p-2 mb-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span>{slot.startTime}</span>
                        <button
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div>{slot.endTime}</div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Break Time Settings */}
      <div className="bg-neutral-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Break Time Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800 p-4 rounded-lg">
            <h3 className="font-medium text-[#F5A623] mb-2">Lunch Break</h3>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>12:00 PM - 1:00 PM</span>
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg">
            <h3 className="font-medium text-[#F5A623] mb-2">Rest Periods</h3>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>15 minutes every 4 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
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