import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'driver' | 'rider';
  timestamp: string;
}

interface ChatBoxProps {
  driverId: string;
  driver: {
    id: string;
    name: string;
  };
  onClose: () => void;
}

export function ChatBox({ driverId, driver, onClose }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load current ride request
    const currentRide = JSON.parse(localStorage.getItem('currentRideRequest') || '{}');
    
    // Load existing messages
    const allRides = JSON.parse(localStorage.getItem('pendingRides') || '[]');
    const thisRide = allRides.find((ride: any) => ride.id === currentRide.id);
    
    if (thisRide?.messages) {
      setMessages(thisRide.messages);
      const lastMessage = thisRide.messages[thisRide.messages.length - 1];
      setIsWaitingForResponse(lastMessage?.sender === 'rider');
    }
    
    // Set up storage event listener
    const handleStorageChange = () => {
      const updatedRides = JSON.parse(localStorage.getItem('pendingRides') || '[]');
      const updatedRide = updatedRides.find((ride: any) => ride.id === currentRide.id);
      if (updatedRide?.messages) {
        setMessages(updatedRide.messages);
        const lastMessage = updatedRide.messages[updatedRide.messages.length - 1];
        setIsWaitingForResponse(lastMessage?.sender === 'rider');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isWaitingForResponse) return;

    const currentRide = JSON.parse(localStorage.getItem('currentRideRequest') || '{}');
    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'rider',
      timestamp: new Date().toLocaleTimeString()
    };

    // Update messages in state
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsWaitingForResponse(true);

    // Update messages in localStorage
    const allRides = JSON.parse(localStorage.getItem('pendingRides') || '[]');
    const updatedRides = allRides.map((ride: any) => {
      if (ride.id === currentRide.id) {
        return {
          ...ride,
          messages: [...(ride.messages || []), newMessage]
        };
      }
      return ride;
    });
    localStorage.setItem('pendingRides', JSON.stringify(updatedRides));

    // Update driver's rides
    const driverRides = JSON.parse(localStorage.getItem(`driver_${driverId}_rides`) || '[]');
    const updatedDriverRides = driverRides.map((ride: any) => {
      if (ride.id === currentRide.id) {
        return {
          ...ride,
          messages: [...(ride.messages || []), newMessage]
        };
      }
      return ride;
    });
    localStorage.setItem(`driver_${driverId}_rides`, JSON.stringify(updatedDriverRides));

    // Trigger storage event
    window.dispatchEvent(new Event('storage'));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg w-full max-w-md">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">Chat with {driver.name}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="h-96 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'rider' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'rider'
                    ? 'bg-[#F5A623] text-white'
                    : 'bg-neutral-800 text-white'
                }`}
              >
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs opacity-75 mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {isWaitingForResponse && (
            <div className="flex items-center justify-center gap-2 text-neutral-400 bg-neutral-800/50 p-3 rounded-lg">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Waiting for driver's response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-neutral-800">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isWaitingForResponse}
              className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent text-white placeholder-neutral-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isWaitingForResponse}
              className="px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {isWaitingForResponse && (
            <p className="text-sm text-neutral-400 mt-2">
              Please wait for the driver to respond before sending another message.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}