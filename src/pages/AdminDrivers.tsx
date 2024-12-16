import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      const token = await user.getIdTokenResult();
      if (!token.claims.admin) {
        navigate('/');
        return;
      }
    };

    checkAdmin();
  }, [user, navigate]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const q = query(collection(db, 'drivers'), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);
        const driversData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Driver[];
        
        setDrivers(driversData);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast.error('Failed to load pending drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleStatusUpdate = async (driverId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        status: newStatus,
      });
      
      setDrivers(drivers.filter(d => d.id !== driverId));
      toast.success(`Driver ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Failed to update driver status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Pending Driver Approvals</h1>
        
        {drivers.length === 0 ? (
          <div className="text-neutral-400">No pending driver approvals</div>
        ) : (
          <div className="grid gap-6">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-neutral-900 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{driver.name}</h2>
                    <p className="text-neutral-400 mt-1">{driver.email}</p>
                    <p className="text-neutral-400">{driver.phone}</p>
                    <p className="text-neutral-500 text-sm mt-2">
                      Applied: {driver.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStatusUpdate(driver.id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(driver.id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
