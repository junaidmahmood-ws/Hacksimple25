import React from 'react';
import PortfolioChart from './PortfolioChart';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  X
} from 'lucide-react';
import { ChartDataPoint, Holding, TimeRange } from '../types';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Total Balance Header */}
          <div className="flex items-center gap-3 relative">
            <h1 className="text-[42px] text-black ws-balance">
               {balanceVisible ? '$124,592.43' : '$• • • • • •'}
            </h1>
            <button 
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
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
                    px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all
                    ${selectedRange === range 
                      ? 'bg-black text-white' 
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
              <h2 className="text-[17px] font-medium text-black">
                Accounts
              </h2>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Group view <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {[
                  { name: 'Chequing', type: 'Personal', balance: 2500.00 },
                  { name: 'TFSA', type: '2 accounts', balance: 45000.50 },
                  { name: 'Non-registered', type: 'Non-registered', balance: 12000.25 },
                  { name: 'Crypto', type: 'Crypto', balance: 5200.10 }
                ].map((acc, idx) => (
                  <div key={acc.name} className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${idx !== 3 ? 'border-b border-gray-100' : ''}`}>
                    <div>
                      <div className="font-medium text-black text-[15px]">{acc.name}</div>
                      <div className="text-[13px] text-gray-500 mt-0.5">{acc.type}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[17px] text-black">
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
          <div className="mt-2">
             <h2 className="text-[17px] font-medium text-black mb-4">Suggested accounts</h2>
             <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer group">
                <div>
                   <div className="flex items-center gap-2">
                     <span className="font-medium text-black text-[15px]">Retirement Savings (RRSP)</span>
                     <span className="bg-blue-50 text-blue-600 text-[11px] font-medium px-2 py-0.5 rounded">Reduce your tax bill</span>
                   </div>
                   <div className="text-[13px] text-gray-500 mt-1">Retirement savings. Tax-deferred growth.</div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="px-4 py-2 bg-gray-100 text-black font-medium text-[13px] rounded-full group-hover:bg-gray-200 transition-colors">
                     Open account
                   </button>
                   <button className="text-gray-400 hover:text-gray-600 transition-colors">
                     <X className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors group">
               <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
               </div>
               <span className="text-[14px] font-medium text-black">Add money</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors group">
               <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
               </div>
               <span className="text-[14px] font-medium text-black">Transfer money</span>
            </button>
          </div>

          {/* Secondary Links */}
          <div className="space-y-3 px-1">
            <div className="flex items-center gap-3 font-medium text-[14px] text-black cursor-pointer hover:text-gray-500 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add an account
            </div>
            <div className="flex items-center gap-3 font-medium text-[14px] text-black cursor-pointer hover:text-gray-500 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Move an account
            </div>
          </div>

          {/* Paper Trading Ad Card */}
          {!hasJoinedPaperTrading && (
            <div className="bg-stone-100 p-6 rounded-2xl flex flex-col items-center text-center">
              <h3 className="font-medium text-[17px] text-black mb-2">Paper Trading Competition</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
                Test your skills risk-free this holiday season. Top traders win exclusive prizes!
              </p>
              <div className="flex gap-3 w-full">
                 <button 
                   onClick={() => setShowOnboarding()}
                   className="flex-1 py-3 bg-black text-white rounded-full font-medium text-[14px] hover:bg-gray-900 transition-colors"
                 >
                   Join
                 </button>
                 <button className="flex-1 py-3 bg-white text-black border border-gray-200 rounded-full font-medium text-[14px] hover:bg-gray-50 transition-colors">
                   Leaderboard
                 </button>
              </div>
            </div>
          )}

          {/* Holdings Widget (Regular) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-gray-100 mb-1">
              <div className="flex gap-5 text-[14px]">
                <span className="font-medium text-black cursor-pointer">Holdings</span>
                <span className="font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Watchlist</span>
              </div>
              <div className="flex gap-1.5 items-center">
                 <button className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-md">1D</button>
                 <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></button>
                 <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg></button>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
                {holdings.map((holding: any) => (
                    <div key={holding.id} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer transition-colors rounded-xl group">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-[12px] ${holding.iconBg}`}>
                          {holding.ticker.substring(0, 1)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-black text-[14px]">{holding.ticker}</span>
                          <span className="text-gray-500 text-[12px]">{holding.shares} shares</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-black text-[14px]">${holding.value.toFixed(2)} CAD</span>
                        <span className={`text-[12px] ${holding.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
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

