import { useState, useEffect } from 'react';
import { Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../providers/AuthProvider';
import { Driver, ChatMessage } from '../../types';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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

      const savedRidersRef = collection(db, 'saved_riders');
      const q = query(savedRidersRef, where('driverId', '==', driver.id));
      const querySnapshot = await getDocs(q);
      
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
    if (!selectedRider || !messageInput.trim() || !user?.uid) return;

    try {
      const messageData: ChatMessage = {
        id: '', // Will be set by Firestore
        senderId: user.uid,
        receiverId: selectedRider.id,
        content: messageInput.trim(),
        timestamp: new Date(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      messageData.id = docRef.id;
      
      await createNotification({
        userId: selectedRider.id,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${user.displayName || 'your driver'}`,
      });

      setMessageInput('');
      setMessages((prev) => [...prev, messageData]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-full">
      <div className={`w-1/3 border-r border-gray-200 ${selectedRider ? 'hidden md:block' : ''}`}>
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
        <div className="overflow-y-auto">
          {filteredRiders.map((rider) => (
            <div
              key={rider.id}
              onClick={() => setSelectedRider(rider)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
            >
              <MessageCircle className="text-gray-400 mr-3" size={24} />
              <div>
                <h3 className="font-medium">{rider.name}</h3>
                <p className="text-sm text-gray-500">{rider.lastMessage || 'No messages yet'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 ${selectedRider ? 'block' : 'hidden md:block'}`}>
        {selectedRider ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center p-4 border-b">
              <button
                onClick={() => setSelectedRider(null)}
                className="md:hidden mr-2"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="font-medium">{selectedRider.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === user?.uid ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.senderId === user?.uid
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a rider to start messaging
          </div>
        )}
      </div>
    </div>
  );
}