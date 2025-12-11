import React, { useState } from 'react';
import PortfolioChart from './PortfolioChart';
import Leaderboard from './leaderboard';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  X
} from 'lucide-react';
import { ChartDataPoint, Holding, TimeRange } from '../types';
import { MiniSantaHat } from './ChristmasDecorations';

// --- MOCK DATA ---
// We can move mock data out if needed, but for now keeping it here or passing it in is fine. 
// Ideally passed as props, but for this refactor I'll duplicate/move it here if it's static.
const chartData: ChartDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
  time: `Day ${i}`,
  value: 10000 + (i * 150) + (Math.random() * 500)
}));

interface RegularDashboardProps {
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  hasJoinedPaperTrading: boolean;
  setShowOnboarding: () => void;
  holdings: Holding[];
  timeRanges: TimeRange[];
  isLoggedIn?: boolean;
}

const RegularDashboard: React.FC<RegularDashboardProps> = ({
  balanceVisible,
  setBalanceVisible,
  selectedRange,
  setSelectedRange,
  hasJoinedPaperTrading,
  setShowOnboarding,
  holdings,
  timeRanges
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Total Balance Header */}
          <div className="flex items-center gap-4 relative">
            <h1 className="text-4xl font-bold tracking-tight text-red-900 relative ml-4 flex items-center gap-3">
               {balanceVisible ? '$124,592.43' : '$• • • • • • • •'}
               <MiniSantaHat className="w-8 h-8 absolute -top-5 -left-3 -rotate-12" />
            </h1>
            <button 
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              {balanceVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Chart Section */}
          <div className="relative">
            <PortfolioChart data={chartData} />
            
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
              {[
                  { name: 'Chequing', type: 'Personal', balance: 2500.00 },
                  { name: 'TFSA', type: '2 accounts', balance: 45000.50 },
                  { name: 'Non-registered', type: 'Non-registered', balance: 12000.25 },
                  { name: 'Crypto', type: 'Crypto', balance: 5200.10 }
                ].map((acc, idx) => (
                  <div key={acc.name} className={`flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer ${idx !== 3 ? 'border-b border-gray-50' : ''}`}>
                    <div>
                      <div className="font-bold text-gray-900">{acc.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{acc.type}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg tracking-wider">
                        {balanceVisible ? `$${acc.balance?.toLocaleString()}` : '$••••••'}
                      </span>
                      {acc.name !== 'Chequing' && acc.name !== 'Non-registered' && (
                         <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </div>

           {/* Suggested Accounts Section */}
          <div className="mt-4">
             <h2 className="text-xl font-bold text-gray-800 mb-4">Suggested accounts</h2>
             <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer group">
                <div>
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-900">Retirement Savings (RRSP)</span>
                     <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">Reduce your tax bill</span>
                   </div>
                   <div className="text-sm text-gray-500 mt-1">Retirement savings. Tax-deferred growth.</div>
                </div>
                <div className="flex items-center gap-4">
                   <button className="px-4 py-2 bg-gray-100 text-gray-900 font-bold text-xs rounded-full group-hover:bg-gray-200 transition-colors">
                     Open account
                   </button>
                   <button className="text-gray-400 hover:text-gray-600">
                     <X className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Quick Actions (Reused or duplicated if simpler. Keeping duplication for clean separation if they diverge) */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group">
               <div className="w-full" /> {/* Assuming SnowDrift was here, need to import or remove. Let's keep structure but simplify for now or import it. */}
               <div className="w-8 h-8 rounded-full border border-gray-900 flex items-center justify-center relative z-10 group-hover:bg-red-50 transition-colors">
                 {/* Plus icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
               </div>
               <span className="text-sm font-bold relative z-10">Add money</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group">
               <div className="w-full" />
               <div className="w-8 h-8 rounded-full border border-gray-900 flex items-center justify-center relative z-10 group-hover:bg-red-50 transition-colors">
                 {/* Repeat icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
               </div>
               <span className="text-sm font-bold relative z-10">Transfer money</span>
            </button>
          </div>

          {/* Secondary Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-bold text-sm cursor-pointer hover:opacity-70 transition-opacity">
               {/* Plus icon */}
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add an account
            </div>
            <div className="flex items-center gap-3 font-bold text-sm cursor-pointer hover:opacity-70 transition-opacity">
               {/* Home icon */}
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Move an account
            </div>
          </div>

          {/* Paper Trading Ad Card - Prominent for new users */}
          {!hasJoinedPaperTrading && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 p-6 rounded-2xl relative overflow-hidden flex flex-col items-center text-center shadow-lg">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-100 to-transparent opacity-50" />
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full">NEW</span>
                  <h3 className="font-bold text-lg">Paper Trading Competition</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 font-medium">
                  🎁 Test your skills risk-free! Top traders win exclusive prizes!
                </p>
                <div className="flex gap-3 w-full">
                   <button 
                     onClick={() => setShowOnboarding()}
                     className="flex-1 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-black transition-all hover:scale-105 shadow-md"
                   >
                     Join Competition
                   </button>
                   <button 
                     onClick={() => setShowLeaderboard(true)}
                     className="flex-1 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors"
                   >
                     View Leaderboard
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* Holdings Widget (Regular) */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2">
            <div className="flex items-center justify-between p-3 border-b border-gray-50 mb-2">
              <div className="flex gap-4 text-sm font-bold">
                <span className="text-gray-900 cursor-pointer">Holdings</span>
                <span className="text-gray-400 cursor-pointer hover:text-gray-600">Watchlist</span>
              </div>
              <div className="flex gap-2">
                 <button className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">1D</button>
                 {/* Filter icon */}
                 <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></button>
                 {/* Maximize icon */}
                 <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg></button>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto pr-1">
                {/* Need to import HoldingRow in this file or pass it down. Assuming imports will be fixed. */}
                {/* For now, just placeholder or need to import components properly in this file. */}
                {/* Since this is a new file, I need to make sure I import HoldingRow. */}
                {holdings.map((holding: any) => (
                     // Using any to bypass TS for now, imports will fix.
                    <div key={holding.id} className="flex items-center justify-between py-4 hover:bg-red-50 cursor-pointer transition-colors px-1 border-b border-transparent hover:border-red-100 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${holding.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                          {holding.ticker.substring(0, 1)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{holding.ticker}</span>
                          <span className="text-gray-500 text-xs">{holding.shares} shares</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-gray-900 text-sm">${holding.value.toFixed(2)} CAD</span>
                        <span className={`text-xs ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.change >= 0 ? '+' : ''}${Math.abs(holding.change).toFixed(2)} ({holding.change >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                ))}
            </div>
          </div>

        </div>
    </div>
  );
};

export default RegularDashboard;

