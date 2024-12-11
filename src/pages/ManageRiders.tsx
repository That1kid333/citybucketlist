import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';
import { RiderForm } from '../components/riders/RiderForm';
import { RiderList } from '../components/riders/RiderList';
import { Rider, RiderFormData } from '../types/rider';
import {
  addRider,
  updateRider,
  deleteRider,
  getDriverRiders
} from '../lib/services/riders.service';
import { toast } from 'react-hot-toast';

export function ManageRiders() {
  const navigate = useNavigate();
  const { user, driver } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user || !driver) {
      navigate('/driver/login');
      return;
    }

    loadRiders();
  }, [user, driver, navigate]);

  const loadRiders = async () => {
    try {
      setLoading(true);
      const ridersList = await getDriverRiders(user!.uid);
      setRiders(ridersList);
    } catch (error) {
      console.error('Error loading riders:', error);
      toast.error('Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRider = async (data: RiderFormData) => {
    try {
      const newRider = await addRider(user!.uid, data);
      setRiders(prev => [newRider, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding rider:', error);
      throw error;
    }
  };

  const handleUpdateRider = async (data: RiderFormData) => {
    if (!editingRider) return;

    try {
      await updateRider(editingRider.id, data);
      setRiders(prev =>
        prev.map(rider =>
          rider.id === editingRider.id
            ? { ...rider, ...data, updatedAt: new Date().toISOString() }
            : rider
        )
      );
      setEditingRider(null);
    } catch (error) {
      console.error('Error updating rider:', error);
      throw error;
    }
  };

  const handleDeleteRider = async (riderId: string) => {
    try {
      await deleteRider(riderId);
      setRiders(prev => prev.filter(rider => rider.id !== riderId));
      toast.success('Rider deleted successfully');
    } catch (error) {
      console.error('Error deleting rider:', error);
      toast.error('Failed to delete rider');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Manage Riders</h1>
            {!showForm && !editingRider && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#C69249] text-white px-4 py-2 rounded-lg hover:bg-[#A77841] transition-colors"
              >
                Add New Rider
              </button>
            )}
          </div>

          {(showForm || editingRider) && (
            <div className="bg-neutral-900 p-6 rounded-lg mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingRider ? 'Edit Rider' : 'Add New Rider'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRider(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <RiderForm
                onSubmit={editingRider ? handleUpdateRider : handleAddRider}
                initialData={editingRider || undefined}
                isEditing={!!editingRider}
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#C69249] mx-auto"></div>
            </div>
          ) : (
            <RiderList
              riders={riders}
              onEdit={rider => {
                setEditingRider(rider);
                setShowForm(false);
              }}
              onDelete={handleDeleteRider}
            />
          )}
        </div>
      </main>
    </div>
  );
}
