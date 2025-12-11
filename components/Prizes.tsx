import React from 'react';
import { Gift, ArrowLeft } from 'lucide-react';
import { DailyPrize } from '../types';

interface PrizesProps {
  onBack: () => void;
}

const samplePrizes: DailyPrize[] = [
  { day: 'Day 1', title: 'Kickoff Bonus', description: 'Top performer reward', amount: '$500' },
  { day: 'Day 2', title: 'Momentum Award', description: 'Biggest daily gain', amount: '$500' },
  { day: 'Day 3', title: 'Consistency Prize', description: 'Steady growth recognition', amount: '$500' },
];

const Prizes: React.FC<PrizesProps> = ({ onBack }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl mx-auto border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to leaderboard
        </button>
        <div className="flex items-center gap-2 text-amber-700 font-bold">
          <Gift className="w-5 h-5" />
          Prizes
        </div>
      </div>

      <div className="space-y-3">
        {samplePrizes.map(prize => (
          <div
            key={prize.day}
            className="p-4 rounded-2xl border border-gray-100 bg-amber-50 flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase">{prize.day}</div>
              <div className="text-sm font-semibold text-gray-900">{prize.title}</div>
              {prize.description && (
                <div className="text-xs text-gray-600">{prize.description}</div>
              )}
            </div>
            <div className="text-lg font-bold text-amber-700">{prize.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prizes;

