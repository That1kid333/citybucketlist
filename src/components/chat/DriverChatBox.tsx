import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Ride } from '../../types/ride';
import { messagesService } from '../../lib/services/messages.service';
import { useAuth } from '../../providers/AuthProvider';
import { format } from 'date-fns';

interface DriverChatBoxProps {
  ride: Ride;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'driver' | 'rider';
  timestamp: string;
  read: boolean;
}

export default function DriverChatBox({ ride, onClose }: DriverChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = messagesService.subscribeToMessages(ride.id, (newMessages) => {
      setMessages(newMessages);
      // Mark new messages as read
      newMessages
        .filter(msg => !msg.read && msg.senderType === 'rider')
        .forEach(msg => messagesService.markAsRead(msg.id));
    });

    return () => unsubscribe();
  }, [ride.id]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await messagesService.sendMessage({
        rideId: ride.id,
        senderId: user.uid,
        senderType: 'driver',
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Chat with {ride.customerName}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-[400px] overflow-y-auto mb-4 bg-neutral-800 rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="text-zinc-400 text-center">
              No messages yet
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.senderType === 'driver' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.senderType === 'driver'
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-700 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="text-xs text-zinc-500 mt-1">
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
