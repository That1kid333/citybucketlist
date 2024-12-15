import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { Rider } from '../../types/rider';
import { MobileNavigation } from '../../components/mobile/MobileNavigation';
import { User, Star, MessageCircle, UserPlus, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Connection {
  id: string;
  riderId: string;
  driverId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface ManagedRider extends Rider {
  connectionId?: string;
  connectionStatus?: 'pending' | 'accepted' | 'rejected';
}

export default function MobileManagedRidersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [managedRiders, setManagedRiders] = useState<ManagedRider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManagedRiders();
  }, [user]);

  const fetchManagedRiders = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const connectionsRef = collection(db, 'connections');
      const connectionsQuery = query(
        connectionsRef,
        where('driverId', '==', user.uid)
      );

      const connectionsSnapshot = await getDocs(connectionsQuery);
      const connections = connectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Connection[];

      const ridersData: ManagedRider[] = [];
      for (const connection of connections) {
        const riderDoc = await getDocs(query(
          collection(db, 'riders'),
          where('uid', '==', connection.riderId)
        ));
        
        if (!riderDoc.empty) {
          const riderData = riderDoc.docs[0].data();
          ridersData.push({
            ...riderData,
            id: connection.riderId,
            connectionId: connection.id,
            connectionStatus: connection.status,
          } as ManagedRider);
        }
      }

      setManagedRiders(ridersData);
    } catch (error) {
      console.error('Error fetching managed riders:', error);
      toast.error('Failed to load managed riders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionAction = async (riderId: string, connectionId: string, action: 'accept' | 'reject') => {
    if (!user?.uid) return;

    try {
      const connectionRef = doc(db, 'connections', connectionId);
      await updateDoc(connectionRef, {
        status: action === 'accept' ? 'accepted' : 'rejected',
        updatedAt: new Date()
      });

      // Create notification for the rider
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: riderId,
        title: action === 'accept' ? 'Connection Accepted' : 'Connection Rejected',
        message: action === 'accept' 
          ? 'Your connection request has been accepted. You can now message this driver!'
          : 'Your connection request has been rejected.',
        type: action === 'accept' ? 'connection_accepted' : 'connection_rejected',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast.success(action === 'accept' ? 'Connection accepted' : 'Connection rejected');
      fetchManagedRiders();
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">Managed Riders</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
          </div>
        ) : managedRiders.length === 0 ? (
          <div className="text-center text-zinc-400 py-8">
            No riders found
          </div>
        ) : (
          <div className="space-y-4">
            {managedRiders.map((rider) => (
              <div key={rider.id} className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{rider.firstName} {rider.lastName}</h3>
                    <p className="text-sm text-zinc-400 mt-1">Member since {new Date(rider.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      rider.connectionStatus === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      rider.connectionStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {rider.connectionStatus}
                    </span>
                  </div>
                </div>

                {rider.connectionStatus === 'pending' && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleConnectionAction(rider.id, rider.connectionId!, 'reject')}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleConnectionAction(rider.id, rider.connectionId!, 'accept')}
                      className="px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {rider.connectionStatus === 'accepted' && (
                  <button
                    onClick={() => navigate(`/messages/${rider.id}`)}
                    className="mt-4 w-full px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <MobileNavigation />
    </div>
  );
}
