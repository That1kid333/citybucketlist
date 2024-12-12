import React from 'react';
import { Shield, Check } from 'lucide-react';

interface SubscriptionPlanProps {
  onSubmit: (plan: string) => Promise<void>;
}

export function SubscriptionPlan({ onSubmit }: SubscriptionPlanProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<string>('standard');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(selectedPlan);
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      id: 'standard',
      name: 'Standard Plan',
      price: '$49/month',
      benefits: [
        "Priority ride matching",
        "Lower commission rates",
        "24/7 premium support",
        "Monthly performance bonuses",
        "Exclusive driver events",
        "Advanced booking access"
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '$99/month',
      benefits: [
        "All Standard Plan features",
        "Zero commission rates",
        "VIP support line",
        "Higher performance bonuses",
        "Premium driver events",
        "First access to new features"
      ]
    }
  ];

  return (
    <div className="bg-neutral-900 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-8 h-8 text-[#F5A623]" />
        <h2 className="text-2xl font-bold">Elite Drivers Club</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {plans.map((plan) => (
          <div key={plan.id} className="mb-6">
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-neutral-400 ml-2">/month</span>
            </div>
            
            <p className="text-neutral-400">
              {plan.name}
            </p>

            <ul className="space-y-3 mb-6">
              {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#F5A623]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full py-3 ${selectedPlan === plan.id ? 'bg-[#F5A623] text-white' : 'bg-neutral-700 text-neutral-400'} rounded-lg font-semibold hover:bg-[#E09612] transition-colors`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select'}
            </button>
          </div>
        ))}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#F5A623] text-white rounded-lg font-semibold hover:bg-[#E09612] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Subscribe Now"}
        </button>

        <p className="text-sm text-neutral-400 text-center mt-4">
          Cancel anytime. No long-term commitment required.
        </p>
      </form>
    </div>
  );
}