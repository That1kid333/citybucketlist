import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Send, User, ArrowLeft } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  photo?: string;
  role: 'driver' | 'rider';
}

interface MobileChatProps {
  recipientId: string;
  rideId: string;
  onBack: () => void;
}

export function MobileChat({ recipientId, rideId, onBack }: MobileChatProps) {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useChat(rideId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recipient, setRecipient] = useState<ChatUser | null>(null);

  useEffect(() => {
    // Fetch recipient details
    const fetchRecipient = async () => {
      // Implement recipient fetching logic
    };
    fetchRecipient();
  }, [recipientId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read
    messages
      .filter(m => m.senderId === recipientId && !m.isRead)
      .forEach(m => markAsRead(m.id));
  }, [messages, recipientId, markAsRead]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      await sendMessage({
        senderId: user.uid,
        content: newMessage.trim(),
        timestamp: new Date(),
        isRead: false,
      });
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50">
      {/* Chat Header */}
      <div className="fixed top-0 left-0 right-0 bg-neutral-900 border-b border-neutral-800 px-4 py-3 z-30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2 -ml-2"
            onClick={onBack}
          >
            <ArrowLeft className="w-6 h-6 text-neutral-400" />
          </Button>

          {recipient && (
            <div className="flex items-center gap-3">
              {recipient.photo ? (
                <img
                  src={recipient.photo}
                  alt={recipient.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                  <User className="w-6 h-6 text-neutral-400" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-white">{recipient.name}</h3>
                <p className="text-sm text-neutral-400 capitalize">
                  {recipient.role}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="pt-20 pb-24 px-4 overflow-y-auto h-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  message.senderId === user?.uid
                    ? 'bg-[#C69249] text-white'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            variant="primary"
            className="bg-[#C69249] hover:bg-[#B58239] p-2"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
