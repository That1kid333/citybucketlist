import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type NotificationType = 'message' | 'ride_update' | 'system';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
}: Omit<NotificationData, 'read' | 'createdAt'>) {
  try {
    const notificationData: NotificationData = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
