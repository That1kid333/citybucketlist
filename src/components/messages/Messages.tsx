import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Send } from 'lucide-react';

export interface MessagesProps {
  user: User;
  userType: 'driver' | 'rider' | 'admin';
}

interface Message {
  id: string;
  content: string;
  timestamp: any;
  isDriver: boolean;
  senderId: string;
  driverId?: string;
  riderId?: string;
}

interface ChatPartner {
  id: string;
  name: string;
  email: string;
}

export function Messages({ user, userType }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchChatPartner = async () => {
      try {
        const partnerCollection = userType === 'rider' ? 'drivers' : 'riders';
        const q = query(
          collection(db, partnerCollection),
          where(userType === 'rider' ? 'riderId' : 'driverId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const partnerData = snapshot.docs[0].data();
          setChatPartner({
            id: snapshot.docs[0].id,
            name: partnerData.name || partnerData.email,
            email: partnerData.email
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat partner:', error);
        setLoading(false);
      }
    };

    fetchChatPartner();
  }, [user, userType]);

  useEffect(() => {
    if (!user?.uid || !chatPartner?.id) return;

    const q = query(
      collection(db, 'messages'),
      where(userType === 'rider' ? 'riderId' : 'driverId', '==', user.uid),
      where(userType === 'rider' ? 'driverId' : 'riderId', '==', chatPartner.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [user, chatPartner, userType]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid || !chatPartner?.id) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        timestamp: serverTimestamp(),
        isDriver: userType === 'driver',
        senderId: user.uid,
        driverId: userType === 'driver' ? user.uid : chatPartner.id,
        riderId: userType === 'rider' ? user.uid : chatPartner.id
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  if (!chatPartner) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">No {userType === 'rider' ? 'driver' : 'rider'} assigned yet.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-zinc-900 rounded-lg overflow-hidden">
      <div className="border-b border-zinc-800 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#C69249] flex items-center justify-center text-white">
          {chatPartner.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-medium text-white">{chatPartner.name}</h3>
          <p className="text-sm text-zinc-400">
            {userType === 'rider' ? 'Driver' : 'Rider'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 mt-8">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === user.uid
                  ? 'bg-[#C69249] text-white'
                  : 'bg-zinc-800 text-zinc-200'
              }`}
            >
              <p>{message.content}</p>
              <div
                className={`text-xs mt-1 ${
                  message.senderId === user.uid ? 'text-zinc-200' : 'text-zinc-400'
                }`}
              >
                {message.timestamp?.toDate().toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 text-white placeholder-zinc-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C69249]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-[#C69249] text-white rounded-full hover:bg-[#B58239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
