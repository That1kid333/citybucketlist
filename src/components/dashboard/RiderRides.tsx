import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ride } from '../../types/ride';

interface RiderRidesProps {
  riderId: string;
}

export function RiderRides({ riderId }: RiderRidesProps) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const ridesQuery = query(
          collection(db, 'rides'),
          where('riderId', '==', riderId),
          orderBy('created_at', 'desc')
        );

        const querySnapshot = await getDocs(ridesQuery);
        const ridesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Ride));

        setRides(ridesData);
      } catch (error) {
        console.error('Error fetching rides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [riderId]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName'
    },
    {
      title: 'From',
      dataIndex: 'pickup',
      key: 'pickup'
    },
    {
      title: 'To',
      dataIndex: 'dropoff',
      key: 'dropoff'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`capitalize ${
          status === 'completed' ? 'text-green-500' :
          status === 'cancelled' ? 'text-red-500' :
          'text-yellow-500'
        }`}>
          {status}
        </span>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Your Rides</h1>
      
      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <Table
          dataSource={rides}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="ant-table-dark"
        />
      </div>
    </div>
  );
}
