import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Message, Chat } from '../types/message';

export function useMessaging(userId: string | undefined, userType: 'rider' | 'driver') {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to chats
  useEffect(() => {
    if (!userId) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where(`${userType}Id`, '==', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
      setChats(chatsData);
      setLoading(false);
    });

    return () => {
      unsubscribeChats();
    };
  }, [userId, userType]);

  // Subscribe to messages for the selected chat
  useEffect(() => {
    if (!userId || !selectedChatId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'chats', selectedChatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messagesData);
    });

    return () => {
      unsubscribeMessages();
    };
  }, [userId, selectedChatId]);

  const sendMessage = async (messageData: Omit<Message, 'id'>) => {
    if (!userId || !messageData.chatId) return;

    try {
      const { chatId, ...messageFields } = messageData;
      
      // Add message to the chat's messages subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        ...messageFields,
        timestamp: serverTimestamp(),
      });

      // Update the chat's last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: messageFields.content,
        lastMessageTime: Timestamp.now(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    chats,
    messages,
    loading,
    sendMessage,
    selectedChatId,
    setSelectedChatId,
  };
}
