import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  content: string;
  timestamp: any;
  isDriver: boolean;
  senderId: string;
}

const RiderChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const [driverName, setDriverName] = useState('Your Driver');

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'messages'),
      where('riderId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        timestamp: serverTimestamp(),
        isDriver: false,
        riderId: user.uid,
        senderId: user.uid,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      <div className="border-b border-zinc-800 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#C69249] flex items-center justify-center text-white">
          {driverName.charAt(0)}
        </div>
        <div>
          <h3 className="font-medium text-white">{driverName}</h3>
          <p className="text-sm text-zinc-400">Driver</p>
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
            className={`flex ${message.isDriver ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.isDriver
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'bg-[#C69249] text-white'
              }`}
            >
              <p>{message.content}</p>
              <div
                className={`text-xs mt-1 ${
                  message.isDriver ? 'text-zinc-400' : 'text-zinc-200'
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
};

export default RiderChat;
