import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface SavedRider {
  id: string;
  name: string;
  phone: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  notes?: string;
  driverId: string;
  createdAt: string;
}

export function SavedRiders() {
  const [riders, setRiders] = useState<SavedRider[]>([]);
  const [showAddRider, setShowAddRider] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRider, setNewRider] = useState<Omit<SavedRider, 'id' | 'driverId' | 'createdAt'>>({
    name: '',
    phone: '',
    pickupAddress: '',
    dropoffAddress: '',
    notes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      loadSavedRiders();
    }
  }, [user?.uid]);

  const loadSavedRiders = async () => {
    try {
      setIsLoading(true);
      const ridersRef = collection(db, 'savedRiders');
      const querySnapshot = await getDocs(query(ridersRef, where('driverId', '==', user!.uid)));
      
      const loadedRiders: SavedRider[] = [];
      querySnapshot.forEach((doc) => {
        loadedRiders.push({ id: doc.id, ...doc.data() } as SavedRider);
      });
      
      setRiders(loadedRiders);
    } catch (error) {
      console.error('Error loading saved riders:', error);
      toast.error('Failed to load your saved riders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRider = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to add riders');
      return;
    }

    if (!newRider.name || !newRider.phone) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      const ridersRef = collection(db, 'savedRiders');
      const riderDoc = doc(ridersRef);
      const riderData = {
        ...newRider,
        id: riderDoc.id,
        driverId: user.uid,
        createdAt: new Date().toISOString()
      };

      await setDoc(riderDoc, riderData);
      setRiders(prev => [...prev, riderData]);
      toast.success('Rider saved successfully');
      
      setShowAddRider(false);
      setNewRider({
        name: '',
        phone: '',
        pickupAddress: '',
        dropoffAddress: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving rider:', error);
      toast.error('Failed to save rider. Please try again.');
    }
  };

  const handleDeleteRider = async (id: string) => {
    if (!user?.uid) {
      toast.error('Please sign in to manage riders');
      return;
    }

    try {
      const riderRef = doc(db, 'savedRiders', id);
      await deleteDoc(riderRef);
      setRiders(prev => prev.filter(rider => rider.id !== id));
      toast.success('Rider deleted successfully');
    } catch (error) {
      console.error('Error deleting rider:', error);
      toast.error('Failed to delete rider. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Saved Riders</h2>
        <button
          onClick={() => setShowAddRider(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Rider
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C69249]" />
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Saved Riders</h3>
          <p className="text-zinc-400">
            Add your frequent riders to quickly schedule rides with them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="bg-zinc-900 rounded-lg p-6 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-lg text-white">{rider.name}</h3>
                <p className="text-zinc-400">{rider.phone}</p>
                {rider.pickupAddress && (
                  <p className="text-sm text-zinc-400 mt-1">
                    Pickup: {rider.pickupAddress}
                  </p>
                )}
                {rider.dropoffAddress && (
                  <p className="text-sm text-zinc-400">
                    Drop-off: {rider.dropoffAddress}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {/* Implement message functionality */}}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteRider(rider.id)}
                  className="p-2 text-red-400 hover:text-red-500 rounded-full hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddRider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">Add New Rider</h3>
                  <p className="text-zinc-400">Enter rider details below</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddRider(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newRider.name}
                  onChange={(e) => setNewRider(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
                  placeholder="Enter rider's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={newRider.phone}
                  onChange={(e) => setNewRider(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Default Pickup Address
                </label>
                <input
                  type="text"
                  value={newRider.pickupAddress}
                  onChange={(e) => setNewRider(prev => ({ ...prev, pickupAddress: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
                  placeholder="Enter pickup address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Default Drop-off Address
                </label>
                <input
                  type="text"
                  value={newRider.dropoffAddress}
                  onChange={(e) => setNewRider(prev => ({ ...prev, dropoffAddress: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
                  placeholder="Enter drop-off address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Notes
                </label>
                <textarea
                  value={newRider.notes}
                  onChange={(e) => setNewRider(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-[#C69249]"
                  placeholder="Add any notes about this rider"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddRider(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRider}
                className="px-4 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
              >
                Save Rider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
