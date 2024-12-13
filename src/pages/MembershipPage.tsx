import React from 'react';
import { Card, Button, List } from 'antd';
import { Check } from 'lucide-react';
import { Header } from '../components/Header';

const membershipBenefits = [
  'Priority ride requests and matching',
  'Lower platform fees (15% vs 20%)',
  'Access to premium riders and high-value rides',
  'Ability to transfer rides to other drivers',
  'Monthly driver meetups and networking events',
  'Dedicated support line',
  'Professional profile badge',
  'Early access to new features',
  'Performance analytics dashboard',
  'Custom branding opportunities'
];

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">Premium Driver Membership</h1>
          <p className="text-zinc-400 text-lg">
            Unlock exclusive benefits and maximize your earnings with our Premium Driver Membership
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Standard Driver</h2>
              <p className="text-zinc-400">Basic features for casual drivers</p>
              <div className="text-3xl font-bold text-white mt-4">Free</div>
            </div>
            <List
              dataSource={[
                'Basic ride requests',
                'Standard platform fee (20%)',
                'Regular support',
                'Basic analytics',
                'Standard driver profile'
              ]}
              renderItem={(item) => (
                <List.Item className="text-zinc-400 border-none">
                  <Check className="w-5 h-5 text-[#C69249] mr-2" />
                  {item}
                </List.Item>
              )}
            />
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#C69249] text-white px-3 py-1 rounded-full text-sm">
              Recommended
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Premium Driver</h2>
              <p className="text-zinc-400">Enhanced features for professional drivers</p>
              <div className="text-3xl font-bold text-white mt-4">
                $19.99<span className="text-lg text-zinc-400">/month</span>
              </div>
            </div>
            <List
              dataSource={membershipBenefits}
              renderItem={(item) => (
                <List.Item className="text-zinc-400 border-none">
                  <Check className="w-5 h-5 text-[#C69249] mr-2" />
                  {item}
                </List.Item>
              )}
            />
            <Button
              type="primary"
              size="large"
              className="w-full mt-6 bg-[#C69249] hover:bg-[#B58239] border-none h-12"
            >
              Coming Soon
            </Button>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Why Become a Premium Driver?</h3>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Premium drivers earn on average 30% more than standard drivers through a combination of 
            lower platform fees, priority matching, and access to high-value rides. Plus, you'll get 
            exclusive access to our ride transfer system, allowing you to maintain high customer 
            satisfaction even when you're unavailable.
          </p>
        </div>
      </div>
    </div>
  );
}
