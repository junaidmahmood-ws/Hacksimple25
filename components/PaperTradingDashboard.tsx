import React, { useState, useEffect } from 'react';
import PortfolioChart from './PortfolioChart';
import StockSearch from './StockSearch';
import StockDetailView from './StockDetailView';
import TradeModal from './TradeModal';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Ghost,
  Plus,
  Repeat,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { MiniSantaHat } from './ChristmasDecorations';
import { ChartDataPoint, TimeRange } from '../types';

interface PaperTradingDashboardProps {
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  setIsPaperTrading: (isPaper: boolean) => void;
  timeRanges: TimeRange[];
}

const INITIAL_BALANCE = 10000;

// Generate random icon colors
const iconColors = [
  'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 
  'bg-yellow-500', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600'
];

const getRandomColor = () => iconColors[Math.floor(Math.random() * iconColors.length)];

const PaperTradingDashboard: React.FC<PaperTradingDashboardProps> = ({
  balanceVisible,
  setBalanceVisible,
  selectedRange,
  setSelectedRange,
  setIsPaperTrading,
  timeRanges
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* LEFT COLUMN (Main Content) */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        
        {/* Total Balance Header */}
        <div className="flex items-center gap-3 relative">
          <h1 className="text-[42px] text-black ws-balance flex items-center">
             {balanceVisible ? '$10,000.00' : '$• • • • • •'}
             <button 
               onClick={() => setIsPaperTrading(false)}
               className="ml-3 bg-amber-50 text-amber-700 text-[11px] font-medium px-2.5 py-1 rounded-md border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
               title="Exit Paper Trading Mode"
             >
               PAPER
             </button>
          </h1>
          <button 
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            {balanceVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Chart Section - Flat Line for Paper Trading */}
        <div className="relative">
          <PortfolioChart data={Array.from({ length: 50 }, (_, i) => ({ time: `Day ${i}`, value: 10000 }))} />
          
          {/* Timeframe Selector */}
          <div className="flex items-center justify-center mt-6 gap-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`
                  px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all
                  ${selectedRange === range 
                    ? 'bg-black text-white' 
                    : 'bg-transparent text-gray-500 hover:bg-gray-100'
                  }
                `}
              >
                Reset Portfolio
              </button>
            </div>

        {/* Accounts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-medium text-black">
              Accounts
            </h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Group view <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
             <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
               <div>
                 <div className="font-medium text-black text-[15px]">Paper Trading</div>
                 <div className="text-[13px] text-gray-500 mt-0.5">Competition Account</div>
               </div>
               <div className="flex items-center gap-3">
                 <span className="font-medium text-[17px] text-black">
                   {balanceVisible ? '$10,000.00' : '$••••••'}
                 </span>
                 <ChevronDown className="w-4 h-4 text-gray-400" />
               </div>
               <span className="text-sm font-bold relative z-10">Transfer money</span>
            </button>
          </div>

      {/* RIGHT COLUMN (Sidebar) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors group">
             <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-gray-50 transition-colors">
               <Plus className="w-5 h-5 text-black" />
             </div>
             <span className="text-[14px] font-medium text-black">Add money</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors group">
             <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-gray-50 transition-colors">
               <Repeat className="w-5 h-5 text-black" />
             </div>
             <span className="text-[14px] font-medium text-black">Transfer money</span>
          </button>
        </div>

        {/* Holdings Widget (Paper) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3">
          <div className="flex items-center justify-between px-2 pb-3 border-b border-gray-100 mb-1">
            <div className="flex gap-5 text-[14px]">
              <span className="font-medium text-black cursor-pointer">Holdings</span>
              <span className="font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Watchlist</span>
            </div>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                 <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Ghost className="w-7 h-7 text-gray-400" />
                 </div>
                 <h3 className="font-medium text-black text-[15px]">No holdings yet</h3>
                 <p className="text-[13px] text-gray-500 mt-1 max-w-[200px]">Start trading to build your competition portfolio.</p>
                 <button 
                   onClick={() => setShowTradeModal(true)}
                   className="mt-4 px-5 py-2.5 bg-black text-white rounded-full text-[13px] font-medium hover:bg-gray-900 transition-colors"
                 >
                   Make a trade
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaperTradingDashboard;
