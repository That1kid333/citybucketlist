import { useState } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';

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

  const handleAddSchedule = () => {
    if (!selectedDay || !startTime || !endTime) return;

    const newSchedule: Schedule = {
      day: selectedDay,
      startTime,
      endTime
    };

    onScheduleUpdate([...schedules, newSchedule]);
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Schedule Manager</h3>
        <Calendar className="w-5 h-5 text-[#F5A623]" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
          >
            <option value="">Select Day</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>

          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#F5A623]" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#F5A623]" />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
            />
          </div>
        </div>

        <button
          onClick={handleAddSchedule}
          className="w-full px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Schedule</span>
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
          >
            <div>
              <div className="font-semibold capitalize">{schedule.day}</div>
              <div className="text-sm text-neutral-400">
                {schedule.startTime} - {schedule.endTime}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}