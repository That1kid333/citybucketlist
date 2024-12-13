import React from 'react';
import { Card, Row, Col, Button, Tag } from 'antd';
import { Crown, Check } from 'lucide-react';

interface MembershipTier {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

const membershipTiers: MembershipTier[] = [
  {
    name: 'Basic',
    price: 'Free',
    features: [
      'Book rides',
      'Basic rider support',
      'Standard pickup times'
    ]
  },
  {
    name: 'Premium',
    price: '$9.99/month',
    features: [
      'Priority booking',
      'Premium rider support',
      'Faster pickup times',
      'Exclusive drivers',
      'Ride cancellation protection'
    ],
    recommended: true
  },
  {
    name: 'Business',
    price: '$49.99/month',
    features: [
      'All Premium features',
      'Business account management',
      'Multiple riders under one account',
      'Monthly billing',
      'Dedicated account manager',
      'Custom ride scheduling'
    ]
  }
];

const RiderMembership: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Membership Plans</h2>
        <p className="text-gray-600">Choose the plan that best fits your needs</p>
      </div>
      
      <Row gutter={[16, 16]}>
        {membershipTiers.map((tier) => (
          <Col key={tier.name} xs={24} md={8}>
            <Card 
              className={`h-full ${tier.recommended ? 'border-primary shadow-lg' : ''}`}
              title={
                <div className="flex items-center justify-between">
                  <span>{tier.name}</span>
                  {tier.recommended && (
                    <Tag color="gold" icon={<Crown size={14} />}>
                      Recommended
                    </Tag>
                  )}
                </div>
              }
            >
              <div className="mb-4">
                <div className="text-2xl font-bold">{tier.price}</div>
                {tier.price !== 'Free' && <div className="text-sm text-gray-500">per month</div>}
              </div>
              
              <div className="space-y-2 mb-6">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button type={tier.recommended ? 'primary' : 'default'} block>
                {tier.price === 'Free' ? 'Current Plan' : 'Upgrade Now'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RiderMembership;
