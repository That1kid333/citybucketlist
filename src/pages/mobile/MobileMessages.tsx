import { useState } from 'react';
import { MobileNavigation } from '../../components/mobile/MobileNavigation';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, User } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export function MobileMessages() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('Messages');
  const [newMessage, setNewMessage] = useState('');

  // Mock data - replace with actual data from your backend
  const messages: Message[] = [
    {
      id: '1',
      senderId: '123',
      senderName: 'John Doe',
      content: 'Hi, I'll be at the pickup location in 5 minutes.',
      timestamp: new Date(),
      isRead: false,
    },
    {
      id: '2',
      senderId: '456',
      senderName: 'Jane Smith',
      content: 'Thanks for the ride! Have a great day!',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add logic to send message
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <MobileNavigation
        userType={user?.role || 'rider'}
        currentView={currentView}
        userName={user?.displayName || ''}
        userPhoto={user?.photoURL || ''}
        onSignOut={signOut}
      />

      <div className="px-4 py-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Messages List */}
        <div className="space-y-4 mb-20">
          <h2 className="text-lg font-semibold text-white mb-3">Messages</h2>
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`p-4 bg-neutral-900 border-neutral-800 ${
                !message.isRead ? 'border-l-4 border-l-[#C69249]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {message.senderPhoto ? (
                  <img
                    src={message.senderPhoto}
                    alt={message.senderName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                    <User className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white">
                      {message.senderName}
                    </h3>
                    <span className="text-xs text-neutral-400">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-neutral-300">{message.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Message Input */}
        <div className="fixed bottom-20 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="primary"
              className="bg-[#C69249] hover:bg-[#B58239] p-2"
              onClick={handleSendMessage}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
