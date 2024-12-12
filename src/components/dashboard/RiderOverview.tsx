import React from 'react';
import { Card } from 'antd';
import { Rider } from '../../types/rider';

interface RiderOverviewProps {
  rider: Rider | null;
}

export function RiderOverview({ rider }: RiderOverviewProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Welcome back, {rider?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Rides</h3>
          <p className="text-zinc-400">View your recent ride history</p>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-2">Favorite Drivers</h3>
          <p className="text-zinc-400">Connect with your preferred drivers</p>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
          <p className="text-zinc-400">Chat with your drivers</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
          <div className="space-y-2 text-zinc-400">
            <p><span className="font-medium text-white">Name:</span> {rider?.name}</p>
            <p><span className="font-medium text-white">Email:</span> {rider?.email}</p>
            <p><span className="font-medium text-white">Phone:</span> {rider?.phone}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
