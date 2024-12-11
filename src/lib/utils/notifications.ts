import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

interface Notification {
  type: 'DRIVER_REQUEST' | 'RIDE_ACCEPTED' | 'RIDE_REJECTED';
  title: string;
  message: string;
  recipientId: string;
  senderId: string;
  status: 'unread' | 'read';
  createdAt: string;
  rideId?: string;
}

export async function sendNotification(notification: Omit<Notification, 'createdAt' | 'status'>) {
  try {
    const notificationData: Notification = {
      ...notification,
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'notifications'), notificationData);
    
    // If you want to implement email notifications, you would call your email service here
    // For now, we'll just log it
    console.log('Notification sent:', notificationData);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
