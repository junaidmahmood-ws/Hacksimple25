import React from 'react';
import { Holding } from '../types';

interface HoldingRowProps {
  holding: Holding;
}

const HoldingRow: React.FC<HoldingRowProps> = ({ holding }) => {
  const isPositive = holding.change >= 0;

  return (
    <div className="flex items-center justify-between py-4 hover:bg-red-50 cursor-pointer transition-colors px-1 border-b border-transparent hover:border-red-100 rounded-lg group">
      <div className="flex items-center gap-3">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${holding.iconBg} shadow-sm group-hover:scale-110 transition-transform`}
        >
          {holding.ticker.substring(0, 1)}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">{holding.ticker}</span>
          <span className="text-gray-500 text-xs">{holding.shares} shares</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-bold text-gray-900 text-sm">${holding.value.toFixed(2)} CAD</span>
        <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${Math.abs(holding.change).toFixed(2)} ({isPositive ? '+' : ''}{holding.changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
};

export default HoldingRow;
