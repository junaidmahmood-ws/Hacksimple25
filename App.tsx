import React, { useState } from 'react';
import Header from './components/Header';
import PortfolioChart from './components/PortfolioChart';
import HoldingRow from './components/HoldingRow';
import { MiniSantaHat, Snowflakes, SnowDrift } from './components/ChristmasDecorations';
import { 
  Eye, 
  EyeOff, 
  X, 
  ChevronDown, 
  MoreHorizontal, 
  Plus, 
  Repeat, 
  Home, 
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Filter,
  ArrowUpRight,
  Gift
} from 'lucide-react';
import { ChartDataPoint, Holding, TimeRange } from './types';

// --- MOCK DATA ---
const chartData: ChartDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
  time: `Day ${i}`,
  value: 10000 + (i * 150) + (Math.random() * 500)
}));

const holdings: Holding[] = [
  { id: '1', ticker: 'SOFI', shares: 25, value: 675.75, change: 5.00, changePercent: 0.75, iconBg: 'bg-red-600' },
  { id: '2', ticker: 'PLTR', shares: 10, value: 143.10, change: 3.40, changePercent: 2.43, iconBg: 'bg-green-700' },
  { id: '3', ticker: 'VFV', shares: 10, value: 1684.60, change: 1.20, changePercent: 0.07, iconBg: 'bg-red-700' },
  { id: '4', ticker: 'XAW', shares: 8, value: 412.88, change: 0.88, changePercent: 0.21, iconBg: 'bg-green-800' },
  { id: '5', ticker: 'AMZN', shares: 2, value: 53.86, change: 0.80, changePercent: 1.51, iconBg: 'bg-yellow-500' },
  { id: '6', ticker: 'TSLA', shares: 5, value: 196.40, change: -0.10, changePercent: -0.05, iconBg: 'bg-red-500' },
  { id: '7', ticker: 'GOOG', shares: 2, value: 103.34, change: 0.14, changePercent: 0.14, iconBg: 'bg-green-600' },
  { id: '8', ticker: 'ETH', shares: 0.01570448, value: 72.34, change: 0.0163, changePercent: 0.02, iconBg: 'bg-yellow-600' },
  { id: '9', ticker: 'BB', shares: 10, value: 60.90, change: -0.30, changePercent: -0.49, iconBg: 'bg-gray-800' },
  { id: '10', ticker: 'NVDA', shares: 2, value: 83.60, change: -0.48, changePercent: -0.57, iconBg: 'bg-green-700' },
];

const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

function App() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('ALL');

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 relative overflow-hidden">
      <Snowflakes />
      <Header />

      <main className="max-w-[1400px] mx-auto pt-10 px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Total Balance Header */}
          <div className="flex items-center gap-4 relative">
            <h1 className="text-4xl font-bold tracking-tight text-red-900 relative ml-4">
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
          
          {/* Quick Actions */}
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

          {/* Secondary Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-bold text-sm cursor-pointer hover:opacity-70 transition-opacity">
              <Plus className="w-4 h-4" /> Add an account
            </div>
            <div className="flex items-center gap-3 font-bold text-sm cursor-pointer hover:opacity-70 transition-opacity">
              <Home className="w-4 h-4" /> Move an account
            </div>
          </div>

          {/* Carousel Card */}
          <div className="bg-[#f0efeb] p-6 rounded-2xl relative overflow-hidden">
            <SnowDrift className="bg-white/50" />
            <div className="flex justify-between items-start mb-10 relative z-10">
               <span className="text-xs font-bold text-gray-500">1 of 5</span>
               <div className="flex gap-2">
                 <button className="p-1 rounded-full bg-black/5 hover:bg-black/10">
                   <ChevronLeft className="w-4 h-4 text-gray-500" />
                 </button>
                 <button className="p-1 rounded-full bg-black/5 hover:bg-black/10">
                   <ChevronRight className="w-4 h-4 text-gray-500" />
                 </button>
               </div>
            </div>
            <h3 className="font-bold text-lg mb-2">iPhone, Mac, or both</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Keep going! Move $100,000+ by January 1 to qualify. T&Cs apply.
            </p>
            <div className="flex items-center justify-between">
               <button className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-black">
                 <ArrowRight className="w-4 h-4" />
               </button>
               {/* Mock Image Placeholder */}
               <div className="w-20 h-24 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-lg shadow-sm border border-white/50 rotate-3"></div>
            </div>
          </div>

          {/* Holdings Widget */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2">
            <div className="flex items-center justify-between p-3 border-b border-gray-50 mb-2">
              <div className="flex gap-4 text-sm font-bold">
                <span className="text-gray-900 cursor-pointer">Holdings</span>
                <span className="text-gray-400 cursor-pointer hover:text-gray-600">Watchlist</span>
              </div>
              <div className="flex gap-2">
                 <button className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">1D</button>
                 <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><Filter className="w-3 h-3" /></button>
                 <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><Maximize2 className="w-3 h-3" /></button>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto pr-1">
              {holdings.map(holding => (
                <HoldingRow key={holding.id} holding={holding} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
