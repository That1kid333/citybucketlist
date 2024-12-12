import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface EarningsSummary {
  today: number;
  week: number;
  month: number;
  total: number;
  rides: number;
  commission: number;
}

interface EarningsCenterProps {
  earnings: EarningsSummary;
  onUpdatePayment: () => void;
}

export function EarningsCenter({ earnings, onUpdatePayment }: EarningsCenterProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400">Today's Earnings</span>
            <DollarSign className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="text-2xl font-bold">${earnings.today.toFixed(2)}</div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400">This Week</span>
            <Calendar className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="text-2xl font-bold">${earnings.week.toFixed(2)}</div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400">This Month</span>
            <TrendingUp className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="text-2xl font-bold">${earnings.month.toFixed(2)}</div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400">Total Earnings</span>
            <TrendingUp className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="text-2xl font-bold">${earnings.total.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400">Total Rides</span>
            <div className="text-[#F5A623]">{earnings.rides}</div>
          </div>
          <div className="text-sm text-neutral-500">
            Lifetime completed rides
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400">Commission Rate</span>
            <div className="text-[#F5A623]">{earnings.commission}%</div>
          </div>
          <div className="text-sm text-neutral-500">
            Platform service fee
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payment Settings</h3>
          <CreditCard className="w-5 h-5 text-[#F5A623]" />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <p className="text-neutral-400">Current Payment Method</p>
            <p className="text-sm text-neutral-500">Update your payment details and payout preferences</p>
          </div>
          
          <button
            onClick={onUpdatePayment}
            className="px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
          >
            Update Payment Info
          </button>
        </div>
      </div>
    </div>
  );
}