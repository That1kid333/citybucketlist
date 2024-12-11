import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Search, Phone, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderType: 'driver' | 'rider';
  content: string;
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: string;
  riderId: string;
  riderName: string;
  riderPhoto: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

const QUICK_RESPONSES = [
  "I'm on my way!",
  "I've arrived at the pickup location",
  "Running about 5 minutes late, sorry for the delay",
  "Traffic is heavy, but I'm making progress",
  "Could you confirm your exact pickup location?",
  "I'm in the black Toyota Camry"
];

export function CommunicationHub() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentDriver = JSON.parse(localStorage.getItem('currentDriver') || '{}');
    const rides = JSON.parse(localStorage.getItem(`driver_${currentDriver.id}_rides`) || '[]');
    
    const loadedChats: Chat[] = rides.map((ride: any) => ({
      id: ride.id,
      riderId: ride.customerId,
      riderName: ride.customerName || 'Unknown Rider',
      riderPhoto: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400',
      lastMessage: ride.messages?.[ride.messages.length - 1]?.content || 'No messages yet',
      lastMessageTime: ride.messages?.[ride.messages.length - 1]?.timestamp || ride.created_at,
      unreadCount: ride.messages?.filter((m: Message) => !m.read && m.senderType === 'rider').length || 0,
      messages: ride.messages || []
    }));

    setChats(loadedChats);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  const handleSendMessage = (content: string) => {
    if (!selectedChat || !content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'driver',
      senderType: 'driver',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: true
    };

    const updatedChat = {
      ...selectedChat,
      lastMessage: newMessage.content,
      lastMessageTime: newMessage.timestamp,
      messages: [...selectedChat.messages, newMessage]
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? updatedChat : chat
    ));
    setSelectedChat(updatedChat);
    setMessage('');
    setShowQuickResponses(false);

    const currentDriver = JSON.parse(localStorage.getItem('currentDriver') || '{}');
    const rides = JSON.parse(localStorage.getItem(`driver_${currentDriver.id}_rides`) || '[]');
    const updatedRides = rides.map((ride: any) => 
      ride.id === selectedChat.id 
        ? { ...ride, messages: updatedChat.messages }
        : ride
    );
    localStorage.setItem(`driver_${currentDriver.id}_rides`, JSON.stringify(updatedRides));
  };

  const filteredChats = chats.filter(chat => 
    chat.riderName.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-neutral-900 rounded-lg overflow-hidden">
      {/* Rest of the component implementation remains the same */}
    </div>
  );
}