import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, X, MessageCircle, UserPlus, Check, Calendar, Car } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'connection_request' | 'connection_accepted' | 'ride_request' | 'ride_accepted' | 'message' | 'ride_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface MobileHeaderProps {
  userName?: string;
  userPhoto?: string;
  onSignOut: () => void;
}

export function MobileHeader({
  userName,
  userPhoto,
  onSignOut
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationData.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          read: data.read,
          createdAt: data.createdAt.toDate()
        });
      });
      setNotifications(notificationData);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    const notificationRef = doc(db, 'notifications', notification.id);
    await updateDoc(notificationRef, { read: true });

    // Navigate based on notification type
    switch (notification.type) {
      case 'connection_request':
      case 'connection_accepted':
        navigate('/driver/portal/managed-riders');
        break;
      case 'ride_request':
      case 'ride_accepted':
        navigate('/driver/portal/schedule');
        break;
      case 'message':
        navigate('/driver/portal/messages');
        break;
    }

    setShowNotifications(false);
  };

  return (
    <header className="bg-black text-white border-b border-neutral-800 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-neutral-800 text-neutral-400"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-[#C69249] text-white text-xs flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative p-2 rounded-lg hover:bg-neutral-800"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName || 'Profile'}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <User className="w-6 h-6 text-neutral-400" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute top-full right-0 w-full md:w-96 mt-2 bg-neutral-900 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="divide-y divide-neutral-800">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-neutral-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 text-left hover:bg-neutral-800 transition-colors ${
                    !notification.read ? 'bg-neutral-800/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'connection_request' || notification.type === 'connection_accepted' ? (
                        <UserPlus className="h-5 w-5 text-[#C69249]" />
                      ) : notification.type === 'ride_request' || notification.type === 'ride_accepted' ? (
                        <Calendar className="h-5 w-5 text-[#C69249]" />
                      ) : notification.type === 'message' ? (
                        <MessageCircle className="h-5 w-5 text-[#C69249]" />
                      ) : (
                        <Bell className="h-5 w-5 text-[#C69249]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-neutral-400">{notification.message}</p>
                      <p className="text-xs text-neutral-500">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Profile Menu */}
      {showProfileMenu && (
        <div className="fixed top-16 right-4 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-40">
          <div className="p-2">
            {userName && (
              <div className="px-3 py-2 text-sm text-white font-medium border-b border-neutral-800">
                {userName}
              </div>
            )}
            <button
              onClick={onSignOut}
              className="w-full px-3 py-2 text-sm text-red-400 hover:bg-neutral-800 rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
