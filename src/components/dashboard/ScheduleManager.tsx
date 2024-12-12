import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleManagerProps {
  schedules: Schedule[];
  onScheduleUpdate: (schedules: Schedule[]) => void;
}

export function ScheduleManager({ schedules, onScheduleUpdate }: ScheduleManagerProps) {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateTimeRange = (start: string, end: string): boolean => {
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    return startDate < endDate;
  };

  const handleAddSchedule = () => {
    setError('');

    if (!selectedDay || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateTimeRange(startTime, endTime)) {
      setError('End time must be after start time');
      return;
    }

    // Check for overlapping schedules
    const hasOverlap = schedules.some(schedule => {
      if (schedule.day === selectedDay) {
        const existingStart = new Date(`2000-01-01T${schedule.startTime}`);
        const existingEnd = new Date(`2000-01-01T${schedule.endTime}`);
        const newStart = new Date(`2000-01-01T${startTime}`);
        const newEnd = new Date(`2000-01-01T${endTime}`);

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      }
      return false;
    });

    if (hasOverlap) {
      setError('This time slot overlaps with an existing schedule');
      return;
    }

    const newSchedule: Schedule = {
      day: selectedDay,
      startTime,
      endTime
    };

    onScheduleUpdate([...schedules, newSchedule]);
    
    // Reset form
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
  };

  const handleRemoveSchedule = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    onScheduleUpdate(updatedSchedules);
  };

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
  ];

  return (
    <div className="bg-neutral-900 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Schedule Manager</h3>
        <Calendar className="w-5 h-5 text-[#F5A623]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="bg-neutral-800 text-white rounded-lg p-2"
        >
          <option value="">Select Day</option>
          {days.map(day => (
            <option key={day} value={day.toLowerCase()}>{day}</option>
          ))}
        </select>

        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#F5A623]" />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-neutral-800 text-white rounded-lg p-2"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#F5A623]" />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-neutral-800 text-white rounded-lg p-2"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        onClick={handleAddSchedule}
        className="bg-[#F5A623] text-white px-4 py-2 rounded-lg hover:bg-[#E09612] transition-colors"
      >
        Add Schedule
      </button>

      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <div
            key={`${schedule.day}-${index}`}
            className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
          >
            <div>
              <p className="font-semibold capitalize">{schedule.day}</p>
              <p className="text-neutral-400">
                {schedule.startTime} - {schedule.endTime}
              </p>
            </div>
            <button
              onClick={() => handleRemoveSchedule(index)}
              className="text-red-500 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}