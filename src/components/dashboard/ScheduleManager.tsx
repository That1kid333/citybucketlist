import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { getAuthUrl, addEventToCalendar, listEvents } from '../../services/googleCalendar';
import toast from 'react-hot-toast';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export function ScheduleManager() {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id'>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  });
  const [isGoogleCalendarLinked, setIsGoogleCalendarLinked] = useState(false);

  useEffect(() => {
    const tokens = localStorage.getItem('googleCalendarTokens');
    setIsGoogleCalendarLinked(!!tokens);
    if (tokens) {
      syncWithGoogleCalendar();
    }
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date()), i);
    return format(date, 'EEEE');
  });

  const handleAddSlot = async () => {
    const id = Date.now().toString();
    const newTimeSlot = { ...newSlot, id };
    setAvailableSlots(prev => [...prev, newTimeSlot]);
    
    if (isGoogleCalendarLinked) {
      try {
        const today = new Date();
        const dayIndex = weekDays.indexOf(newSlot.day);
        const slotDate = addDays(startOfWeek(today), dayIndex);
        
        const [startHour, startMinute] = newSlot.startTime.split(':');
        const [endHour, endMinute] = newSlot.endTime.split(':');
        
        const startDateTime = new Date(slotDate);
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
        
        const endDateTime = new Date(slotDate);
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

        await addEventToCalendar({
          summary: 'Available for Rides',
          description: 'Time slot for ride availability',
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() }
        });
        
        toast.success('Time slot added to Google Calendar');
      } catch (error) {
        console.error('Error adding event to Google Calendar:', error);
        toast.error('Failed to add time slot to Google Calendar');
      }
    }

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

  const handleLinkGoogleCalendar = () => {
    const authUrl = getAuthUrl();
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const authWindow = window.open(
      authUrl,
      'Google Calendar Auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data === 'google-calendar-success') {
        setIsGoogleCalendarLinked(true);
        syncWithGoogleCalendar();
        toast.success('Successfully linked Google Calendar!');
      } else if (event.data === 'google-calendar-error') {
        toast.error('Failed to link Google Calendar');
      }

      window.removeEventListener('message', handleMessage);
    };

    window.addEventListener('message', handleMessage);
  };

  const syncWithGoogleCalendar = async () => {
    try {
      const events = await listEvents();
      if (events) {
        const timeSlots = events.map(event => ({
          id: event.id || Date.now().toString(),
          day: format(parseISO(event.start.dateTime), 'EEEE'),
          startTime: format(parseISO(event.start.dateTime), 'HH:mm'),
          endTime: format(parseISO(event.end.dateTime), 'HH:mm')
        }));
        setAvailableSlots(timeSlots);
      }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      toast.error('Failed to sync with Google Calendar');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Schedule Manager</h2>
        <div className="space-x-2">
          {!isGoogleCalendarLinked ? (
            <button
              onClick={handleLinkGoogleCalendar}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Link Google Calendar
            </button>
          ) : (
            <button
              onClick={syncWithGoogleCalendar}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Sync Calendar
            </button>
          )}
          <button
            onClick={() => setShowAddSlot(true)}
            className="flex items-center px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </button>
        </div>
      </div>

      {showAddSlot && (
        <div className="mb-4 p-4 border rounded">
          <div className="grid grid-cols-3 gap-4">
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
              className="border rounded p-2"
            >
              {weekDays.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
              className="border rounded p-2"
            />
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
              className="border rounded p-2"
            />
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowAddSlot(false)}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSlot}
              className="px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              Add Slot
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {availableSlots.map(slot => (
          <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center space-x-4">
              <span className="font-medium">{slot.day}</span>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {slot.startTime} - {slot.endTime}
              </div>
            </div>
            <button
              onClick={() => handleRemoveSlot(slot.id)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}