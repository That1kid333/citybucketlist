import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../providers/AuthProvider';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  isDriver: boolean;
}

interface ChatInterfaceProps {
  riderId: string;
  riderName: string;
}

export function ChatInterface({ riderId, riderName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid || !riderId) return;

    const chatId = [user.uid, riderId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(newMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, riderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid || !riderId) return;

    const chatId = [user.uid, riderId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    try {
      await addDoc(messagesRef, {
        content: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'Driver',
        timestamp: serverTimestamp(),
        isDriver: true
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#C69249] flex items-center justify-center text-white font-semibold">
            {riderName.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-zinc-200">{riderName}</h3>
            <p className="text-sm text-zinc-500">Rider</p>
          </div>
        </div>
        <button className="p-2 hover:bg-zinc-800 rounded-full">
          <MoreVertical className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C69249]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-zinc-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isDriver ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.isDriver
                    ? 'bg-[#C69249] text-zinc-200'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 text-zinc-400 placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C69249]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-[#C69249] text-zinc-200 rounded-full hover:bg-[#B58239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
