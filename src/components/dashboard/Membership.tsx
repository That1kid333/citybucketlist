import React from 'react';
import { Card } from 'antd';
import { Crown } from 'lucide-react';

export default function Membership() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Membership</h2>
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="flex flex-col items-center justify-center py-12">
          <Crown className="w-16 h-16 text-[#C69249] mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Premium Membership Coming Soon!
          </h3>
          <p className="text-zinc-400 text-center max-w-md mb-6">
            We're working on something special for our valued riders. 
            Premium membership will unlock exclusive benefits and features.
          </p>
          <div className="bg-zinc-800 p-4 rounded-lg text-zinc-300">
            <h4 className="font-semibold mb-2">Future Benefits Include:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Priority booking</li>
              <li>Exclusive discounts</li>
              <li>Premium support</li>
              <li>Special event access</li>
              <li>And much more!</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
