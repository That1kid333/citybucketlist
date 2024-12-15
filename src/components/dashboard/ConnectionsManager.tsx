import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Driver } from '../../types/driver';
import { Rider } from '../../types/rider';
import { UserPlus, UserMinus, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Connection {
  id: string;
  driverId: string;
  riderId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ConnectionsManagerProps {
  userType?: 'driver' | 'rider';
  userId?: string;
  riderId?: string;
  onConnectionUpdate?: () => void;
}

export function ConnectionsManager({ userType, userId, riderId, onConnectionUpdate }: ConnectionsManagerProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [availableUsers, setAvailableUsers] = useState<(Driver | Rider)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determine the actual user ID and type based on props
  const effectiveUserId = userId || riderId;
  const effectiveUserType = userType || (riderId ? 'rider' : 'driver');

  useEffect(() => {
    if (effectiveUserId) {
      fetchConnections();
      fetchAvailableUsers();
    }
  }, [effectiveUserId, effectiveUserType]);

  const createNotification = async (userId: string, title: string, message: string, type: 'connection_request' | 'connection_accepted' | 'ride_request' | 'ride_accepted') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const fetchConnections = async () => {
    if (!effectiveUserId) return;
    
    try {
      const connectionsRef = collection(db, 'connections');
      const q = query(
        connectionsRef,
        where(effectiveUserType === 'driver' ? 'driverId' : 'riderId', '==', effectiveUserId)
      );
      
      const querySnapshot = await getDocs(q);
      const connectionsList: Connection[] = [];
      
      querySnapshot.forEach((doc) => {
        connectionsList.push({ id: doc.id, ...doc.data() } as Connection);
      });
      
      setConnections(connectionsList);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    if (!effectiveUserId) return;

    try {
      const usersRef = collection(db, effectiveUserType === 'driver' ? 'riders' : 'drivers');
      const querySnapshot = await getDocs(usersRef);
      const usersList: (Driver | Rider)[] = [];
      
      querySnapshot.forEach((doc) => {
        // Filter out already connected users
        if (!connections.some(conn => 
          conn.driverId === doc.id || conn.riderId === doc.id
        )) {
          usersList.push({ id: doc.id, ...doc.data() } as Driver | Rider);
        }
      });
      
      setAvailableUsers(usersList);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast.error('Failed to load available users');
    }
  };

  const requestConnection = async (targetUserId: string) => {
    if (!effectiveUserId) return;

    try {
      const connectionData = {
        driverId: effectiveUserType === 'driver' ? effectiveUserId : targetUserId,
        riderId: effectiveUserType === 'rider' ? effectiveUserId : targetUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'connections'), connectionData);

      // Send notification to the target user
      const targetUser = availableUsers.find(user => user.id === targetUserId);
      const requestingUserType = effectiveUserType === 'driver' ? 'Driver' : 'Rider';
      
      await createNotification(
        targetUserId,
        'New Connection Request',
        `A ${requestingUserType.toLowerCase()} would like to connect with you`,
        'connection_request'
      );

      toast.success('Connection request sent');
      fetchConnections();
      fetchAvailableUsers();
      onConnectionUpdate?.();
    } catch (error) {
      console.error('Error requesting connection:', error);
      toast.error('Failed to send connection request');
    }
  };

  const updateConnectionStatus = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const connectionRef = doc(db, 'connections', connectionId);
      const connectionDoc = await getDoc(connectionRef);
      
      if (!connectionDoc.exists()) {
        throw new Error('Connection not found');
      }
      
      const connectionData = connectionDoc.data();
      
      await updateDoc(connectionRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      if (status === 'accepted') {
        // Send notification to the requesting user
        const notifyUserId = effectiveUserType === 'driver' ? connectionData.riderId : connectionData.driverId;
        const acceptingUserType = effectiveUserType === 'driver' ? 'Driver' : 'Rider';
        
        await createNotification(
          notifyUserId,
          'Connection Accepted',
          `A ${acceptingUserType.toLowerCase()} has accepted your connection request`,
          'connection_accepted'
        );
      }
      
      toast.success(`Connection ${status}`);
      fetchConnections();
      fetchAvailableUsers();
      onConnectionUpdate?.();
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection');
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      await deleteDoc(doc(db, 'connections', connectionId));
      toast.success('Connection removed');
      fetchConnections();
      fetchAvailableUsers();
      onConnectionUpdate?.();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading connections...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg text-white"
          >
            <span>{connection.status}</span>
            <div className="flex gap-2">
              {connection.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateConnectionStatus(connection.id, 'accepted')}
                    className="p-1 hover:bg-green-600 rounded-full"
                  >
                    <Check className="w-5 h-5 text-green-500" />
                  </button>
                  <button
                    onClick={() => updateConnectionStatus(connection.id, 'rejected')}
                    className="p-1 hover:bg-red-600 rounded-full"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </>
              )}
              {connection.status === 'accepted' && (
                <button
                  onClick={() => removeConnection(connection.id)}
                  className="p-1 hover:bg-red-600 rounded-full"
                >
                  <UserMinus className="w-5 h-5 text-red-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">Available Users</h3>
        {availableUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg text-white"
          >
            <span>{user.name}</span>
            <button
              onClick={() => requestConnection(user.id)}
              className="p-1 hover:bg-green-600 rounded-full"
            >
              <UserPlus className="w-5 h-5 text-green-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
