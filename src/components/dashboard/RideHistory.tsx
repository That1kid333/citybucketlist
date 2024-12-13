import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button } from 'antd';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { MapPin, Clock, DollarSign } from 'lucide-react';

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

  useEffect(() => {
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
            status: data.status || 'Unknown',
            driverName: data.driverName || 'Not assigned',
            price: data.price || 0,
          });
        });
        
        setRides(rideData);
      } catch (error) {
        console.error('Error fetching rides:', error);
        if (error instanceof Error) {
          console.log('Full error details:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [user]);

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
