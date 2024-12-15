import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../providers/AuthProvider';
import { ChatInterface } from './ChatInterface';
import { Driver } from '../../types/driver';
import { createNotification } from '../../utils/notifications';

interface SavedRider {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface CommunicationHubProps {
  driver: Driver;
}

export default function CommunicationHub({ driver }: CommunicationHubProps) {
  const [savedRiders, setSavedRiders] = useState<SavedRider[]>([]);
  const [selectedRider, setSelectedRider] = useState<SavedRider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      loadSavedRiders();
    }
  }, [user?.uid]);

  const loadSavedRiders = async () => {
    try {
      if (!driver || !driver.id) {
        console.error('Driver ID is missing');
        return;
      }

      const ridersRef = collection(db, 'drivers', driver.id, 'savedRiders');
      const querySnapshot = await getDocs(ridersRef);
      
      const riders: SavedRider[] = [];
      querySnapshot.forEach((doc) => {
        const riderData = doc.data();
        riders.push({
          id: doc.id,
          name: riderData.name || '',
          phone: riderData.phone || '',
          email: riderData.email || '',
          lastMessage: riderData.lastMessage,
          lastMessageTime: riderData.lastMessageTime
        });
      });
      
      setSavedRiders(riders);
    } catch (error) {
      console.error('Error loading saved riders:', error);
    }
  };

  const filteredRiders = savedRiders?.filter(rider =>
    rider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider?.phone?.includes(searchTerm)
  ) || [];

  const handleSendMessage = async () => {
    if (!selectedRider || !messageInput.trim()) return;

    try {
      const messageData = {
        senderId: user?.uid,
        receiverId: selectedRider.id,
        content: messageInput.trim(),
        timestamp: new Date(),
        read: false,
      };

      await addDoc(collection(db, 'messages'), messageData);
      
      // Create notification for the recipient
      await createNotification({
        userId: selectedRider.id,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${user?.displayName || 'your driver'}`,
      });

      setMessageInput('');
      setMessages((prev) => [...prev, messageData]);
    } catch (error) {
      console.error('Error sending message:', error);
      // toast.error('Failed to send message');
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:grid lg:grid-cols-[300px,1fr] gap-4">
      {/* Riders List */}
      <div className={`bg-zinc-900 rounded-lg overflow-hidden flex flex-col ${selectedRider ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C69249]"
            />
            <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRiders.length === 0 ? (
            <div className="text-center text-zinc-500 p-4">
              No riders found
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredRiders.map((rider) => (
                <button
                  key={rider.id}
                  onClick={() => setSelectedRider(rider)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    selectedRider?.id === rider.id
                      ? 'bg-[#C69249] text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                    {rider.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{rider.name}</div>
                    <div className="text-sm text-zinc-400">{rider.phone}</div>
                  </div>
                  <MessageCircle className="w-5 h-5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`bg-zinc-900 rounded-lg overflow-hidden ${selectedRider ? 'flex' : 'hidden lg:flex'}`}>
        {selectedRider ? (
          <div className="w-full flex flex-col">
            <div className="bg-zinc-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRider(null)}
                  className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                  {selectedRider.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-white">{selectedRider.name}</div>
                  <div className="text-sm text-zinc-400">{selectedRider.phone}</div>
                </div>
              </div>
            </div>
            <ChatInterface
              riderId={selectedRider.id}
              riderName={selectedRider.name}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              handleSendMessage={handleSendMessage}
              messages={messages}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p>Select a rider to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}