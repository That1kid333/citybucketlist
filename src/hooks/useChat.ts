import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  rideId: string;
}

export function useChat(rideId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('rideId', '==', rideId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          msgs.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate(),
          } as Message);
        });
        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [rideId]);

  const sendMessage = async (message: Omit<Message, 'id'>) => {
    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        ...message,
        rideId,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { isRead: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
  };
}
