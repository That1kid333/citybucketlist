import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { MapPin, Clock, DollarSign, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Ride {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  status: string;
  driverName?: string;
  price: number;
}

export default function RideHistory() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchRides = async () => {
    if (!user) return;

    try {
      const ridesRef = collection(db, 'rides');
      const q = query(
        ridesRef,
        where('riderId', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const rideData: Ride[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        rideData.push({
          id: doc.id,
          pickupLocation: data.pickupLocation,
          dropoffLocation: data.dropoffLocation,
          date: data.date ? new Date(data.date.toDate()).toLocaleString() : 'N/A',
          status: data.status || 'pending',
          driverName: data.driverName || 'Not assigned',
          price: data.price || 0,
        });
      });
      
      setRides(rideData);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [user]);

  const handleCompleteRide = async (rideId: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId);
      await updateDoc(rideRef, {
        status: 'completed',
        completedAt: new Date()
      });
      
      toast.success('Ride marked as completed');
      fetchRides(); // Refresh the list
    } catch (error) {
      console.error('Error completing ride:', error);
      toast.error('Failed to complete ride');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Ride History</h2>
        {rides.length === 0 ? (
          <div className="text-center text-zinc-400 py-8">
            No rides found
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-zinc-900 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center text-zinc-400">
                      <MapPin className="w-4 h-4 mr-2 text-[#C69249]" />
                      <span className="text-sm">Pickup: {ride.pickupLocation}</span>
                    </div>
                    <div className="flex items-center text-zinc-400">
                      <MapPin className="w-4 h-4 mr-2 text-[#C69249]" />
                      <span className="text-sm">Dropoff: {ride.dropoffLocation}</span>
                    </div>
                    <div className="flex items-center text-zinc-400">
                      <Clock className="w-4 h-4 mr-2 text-[#C69249]" />
                      <span className="text-sm">{ride.date}</span>
                    </div>
                    <div className="flex items-center text-zinc-400">
                      <DollarSign className="w-4 h-4 mr-2 text-[#C69249]" />
                      <span className="text-sm">${ride.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      ride.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      ride.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ride.status}
                    </span>
                    {ride.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteRide(ride.id)}
                        className="mt-2 text-sm text-[#C69249] hover:text-[#B58239] transition-colors"
                      >
                        Complete Ride
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => (
        <div className="flex items-center text-zinc-300">
          <Clock className="w-4 h-4 mr-2 text-[#C69249]" />
          {text}
        </div>
      ),
    },
    {
      title: 'Pickup',
      dataIndex: 'pickupLocation',
      key: 'pickupLocation',
      render: (text: string) => (
        <div className="flex items-center text-zinc-300">
          <MapPin className="w-4 h-4 mr-2 text-[#C69249]" />
          {text}
        </div>
      ),
    },
    {
      title: 'Dropoff',
      dataIndex: 'dropoffLocation',
      key: 'dropoffLocation',
      render: (text: string) => (
        <div className="flex items-center text-zinc-300">
          <MapPin className="w-4 h-4 mr-2 text-[#C69249]" />
          {text}
        </div>
      ),
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (text: string) => (
        <span className="text-zinc-300">{text}</span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <div className="flex items-center text-zinc-300">
          <DollarSign className="w-4 h-4 mr-1 text-[#C69249]" />
          {price.toFixed(2)}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        switch (status.toLowerCase()) {
          case 'completed':
            color = 'success';
            break;
          case 'cancelled':
            color = 'error';
            break;
          case 'pending':
            color = 'processing';
            break;
          case 'in progress':
            color = 'warning';
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Ride) => (
        <Button 
          type="link" 
          className="text-[#C69249] hover:text-[#B37F3D]"
          onClick={() => console.log('View details:', record.id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Ride History</h2>
      <Card className="bg-zinc-900 border-zinc-800">
        <Table
          columns={columns}
          dataSource={rides}
          loading={loading}
          rowKey="id"
          className="custom-table"
          pagination={{
            pageSize: 10,
            position: ['bottomCenter'],
            className: 'custom-pagination',
          }}
        />
      </Card>
    </div>
  );
}
