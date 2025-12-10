import React from 'react';
import PortfolioChart from './PortfolioChart';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Ghost,
  Plus,
  Repeat
} from 'lucide-react';
import { MiniSantaHat, SnowDrift } from './ChristmasDecorations';
import { ChartDataPoint, TimeRange } from '../types';

interface PaperTradingDashboardProps {
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  setIsPaperTrading: (isPaper: boolean) => void;
  setShowTradeModal: (show: boolean) => void;
  timeRanges: TimeRange[];
}

const PaperTradingDashboard: React.FC<PaperTradingDashboardProps> = ({
  balanceVisible,
  setBalanceVisible,
  selectedRange,
  setSelectedRange,
  setIsPaperTrading,
  setShowTradeModal,
  timeRanges
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* LEFT COLUMN (Main Content) */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        
        {/* Total Balance Header */}
        <div className="flex items-center gap-4 relative">
          <h1 className="text-4xl font-bold tracking-tight text-red-900 relative ml-4 flex items-center gap-3">
             <>
                {balanceVisible ? '$10,000.00' : '$• • • • • • • •'}
                <button 
                  onClick={() => setIsPaperTrading(false)}
                  className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-md border border-yellow-200 cursor-pointer hover:bg-yellow-200 transition-colors"
                  title="Exit Paper Trading Mode"
                >
                  PAPER
                </button>
             </>
             <MiniSantaHat className="w-8 h-8 absolute -top-5 -left-3 -rotate-12" />
          </h1>
          <button 
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
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
                  px-3 py-1 text-xs font-semibold rounded-full transition-all
                  ${selectedRange === range 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:bg-gray-100'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Accounts <MiniSantaHat className="w-5 h-5 -rotate-12" />
            </h2>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-200">
              Group view <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
             <div className="flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer">
               <div>
                 <div className="font-bold text-gray-900">Paper Trading</div>
                 <div className="text-sm text-gray-500 mt-0.5">Competition Account</div>
               </div>
               <div className="flex items-center gap-4">
                 <span className="font-bold text-lg tracking-wider">
                   {balanceVisible ? '$10,000.00' : '$••••••'}
                 </span>
                 <ChevronDown className="w-4 h-4 text-gray-400" />
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (Sidebar) */}
      <div className="lg:col-span-4 flex flex-col gap-8">
        
        {/* Quick Actions - Same as regular but might want differences later */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group">
             <SnowDrift className="w-full" />
             <div className="w-8 h-8 rounded-full border border-gray-900 flex items-center justify-center relative z-10 group-hover:bg-red-50 transition-colors">
               <Plus className="w-4 h-4" />
             </div>
             <span className="text-sm font-bold relative z-10">Add money</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group">
             <SnowDrift className="w-full" />
             <div className="w-8 h-8 rounded-full border border-gray-900 flex items-center justify-center relative z-10 group-hover:bg-red-50 transition-colors">
               <Repeat className="w-4 h-4" />
             </div>
             <span className="text-sm font-bold relative z-10">Transfer money</span>
          </button>
        </div>

        {/* Holdings Widget (Paper) */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2">
          <div className="flex items-center justify-between p-3 border-b border-gray-50 mb-2">
            <div className="flex gap-4 text-sm font-bold">
              <span className="text-gray-900 cursor-pointer">Holdings</span>
              <span className="text-gray-400 cursor-pointer hover:text-gray-600">Watchlist</span>
            </div>
            {/* Filter buttons removed for simplicity in paper mode or keep consistent? keeping structure */}
          </div>
          
          <div className="max-h-[500px] overflow-y-auto pr-1">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Ghost className="w-8 h-8 text-gray-400" />
                 </div>
                 <h3 className="font-bold text-gray-900">No holdings yet</h3>
                 <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Start trading to build your competition portfolio.</p>
                 <button 
                   onClick={() => setShowTradeModal(true)}
                   className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-black transition-colors"
                 >
                   Make a trade
                 </button>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaperTradingDashboard;

