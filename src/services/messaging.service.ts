import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chat, Message } from '../types/message';

export const messagingService = {
  // Subscribe to chats for a user (either driver or rider)
  subscribeToChats: (userId: string, userType: 'driver' | 'rider', callback: (chats: Chat[]) => void) => {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where(`${userType}Id`, '==', userId),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      callback(chats);
    });
  },

  // Subscribe to messages in a specific chat
  subscribeToMessages: (chatId: string, callback: (messages: Message[]) => void) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages);
    });
  },

  // Send a message in a chat
  sendMessage: async (chatId: string, message: Omit<Message, 'id'>) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    // Add the message
    const messageDoc = await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
    });

    // Update the chat's last message
    await updateDoc(chatRef, {
      lastMessage: message.content,
      lastMessageTime: serverTimestamp(),
      unreadCount: message.senderType === 'driver' ? 0 : 1,
    });

    return messageDoc.id;
  },

  // Start a new chat between a driver and rider
  createChat: async (driverId: string, riderId: string) => {
    // Get driver and rider data
    const driverDoc = await getDoc(doc(db, 'drivers', driverId));
    const riderDoc = await getDoc(doc(db, 'riders', riderId));

    if (!driverDoc.exists() || !riderDoc.exists()) {
      throw new Error('Driver or rider not found');
    }

    const driverData = driverDoc.data();
    const riderData = riderDoc.data();

    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('driverId', '==', driverId),
      where('riderId', '==', riderId)
    );
    const existingChats = await getDocs(q);

    if (!existingChats.empty) {
      return existingChats.docs[0].id;
    }

    // Create new chat
    const chatData: Omit<Chat, 'id'> = {
      driverId,
      riderId,
      driverName: driverData.name,
      riderName: riderData.name,
      driverPhoto: driverData.photoURL,
      riderPhoto: riderData.photoURL,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    };

    const chatDoc = await addDoc(chatsRef, chatData);
    return chatDoc.id;
  },

  // Mark all messages in a chat as read
  markChatAsRead: async (chatId: string, userId: string) => {
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    // Get unread messages
    const q = query(
      messagesRef,
      where('read', '==', false),
      where('receiverId', '==', userId)
    );
    
    const unreadMessages = await getDocs(q);
    
    // Mark each message as read
    const batch = [];
    unreadMessages.forEach((doc) => {
      batch.push(updateDoc(doc.ref, { read: true }));
    });
    
    // Update chat unread count
    batch.push(updateDoc(chatRef, { unreadCount: 0 }));
    
    await Promise.all(batch);
  },

  // Search for a driver by username
  searchDrivers: async (username: string) => {
    const driversRef = collection(db, 'drivers');
    const q = query(
      driversRef,
      where('username', '>=', username),
      where('username', '<=', username + '\uf8ff'),
      orderBy('username'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
};
