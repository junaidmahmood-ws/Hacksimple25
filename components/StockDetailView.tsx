import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Loader2,
  ChevronDown,
  ArrowUpDown,
  Maximize2
} from 'lucide-react';
import { ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';
import { 
  Ticker, 
  getAggregates, 
  getDateRange,
  AggregateBar
} from '../services/massiveApi';
import { TimeRange, PaperTrade } from '../types';
import { MiniSantaHat } from './ChristmasDecorations';
import { OptionsChain, MockOption } from './OptionsChain';
import { OptionsOrderTicket } from './OptionsOrderTicket';

interface StockDetailViewProps {
  ticker: Ticker;
  onBack: () => void;
  onExecuteTrade: (trade: PaperTrade) => void;
  paperBalance: number;
}

interface ChartData {
  time: string;
  value: number;
  timestamp: number;
}

const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y'];

const StockDetailView: React.FC<StockDetailViewProps> = ({ 
  ticker, 
  onBack,
  onExecuteTrade,
  paperBalance
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [activeTab, setActiveTab] = useState<'stock' | 'options'>('stock');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<{ change: number; percent: number } | null>(null);
  const [selectedOption, setSelectedOption] = useState<MockOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trading State
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [buyIn, setBuyIn] = useState<'dollars' | 'shares'>('shares');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Derived Trading Values
  const numericAmount = parseFloat(amount) || 0;
  const estimatedShares = buyIn === 'dollars' && currentPrice 
    ? numericAmount / currentPrice 
    : numericAmount;
  const estimatedCost = buyIn === 'dollars' 
    ? numericAmount 
    : numericAmount * (currentPrice || 0);
  
  const canAfford = estimatedCost <= paperBalance;
  const isValidTrade = numericAmount > 0 && (orderSide === 'sell' || canAfford);

  const handleTrade = async () => {
    if (!isValidTrade || !currentPrice) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const trade: PaperTrade = {
      id: `trade-${Date.now()}`,
      ticker: ticker.ticker,
      name: ticker.name,
      type: 'stock',
      action: orderSide,
      quantity: buyIn === 'shares' ? numericAmount : estimatedShares,
      price: currentPrice,
      totalValue: estimatedCost,
      timestamp: new Date()
    };
    
    onExecuteTrade(trade);
    setIsSubmitting(false);
    setShowSuccess(true);
    setAmount('');
    
    // Reset success message after delay
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoadingChart(true);
      setError(null);
      
      try {
        const { from, to } = getDateRange(selectedRange === 'ALL' ? '1Y' : selectedRange as any);
        const timespan = 'day';
        const multiplier = 1;
        
        const aggResponse = await getAggregates(ticker.ticker, multiplier, timespan, from, to);

        if (aggResponse.results && aggResponse.results.length > 0) {
          const formattedData: ChartData[] = aggResponse.results.map((bar: AggregateBar) => ({
            time: new Date(bar.t).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            }),
            value: bar.c,
            timestamp: bar.t
          }));
          
          setChartData(formattedData);
          
          // Set current price from last bar
          const lastBar = aggResponse.results[aggResponse.results.length - 1];
          setCurrentPrice(lastBar.c);
          
          // Calculate price change
          const firstBar = aggResponse.results[0];
          const change = lastBar.c - firstBar.o;
          const percent = (change / firstBar.o) * 100;
          setPriceChange({ change, percent });
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Rate limited. Please wait a moment and try again.');
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [ticker.ticker, selectedRange]);

  const isPositive = priceChange && priceChange.change >= 0;
  const chartColor = isPositive ? '#16a34a' : '#dc2626';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <span className="text-white font-bold text-xs">{ticker.ticker.slice(0, 2)}</span>
          </div>
          
          {/* Ticker & Name */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{ticker.ticker}</h1>
            <button className="text-gray-300 hover:text-yellow-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>
          <span className="text-sm text-gray-500">{ticker.name}</span>
        </div>

        {/* Tab Toggle - Stocks | Options | Advanced */}
        <div className="flex items-center bg-gray-100 p-1 rounded-full">
          <button 
            onClick={() => setActiveTab('stock')}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'stock' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stocks
          </button>
          <button 
            onClick={() => setActiveTab('options')}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'options' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Options
          </button>
          <button 
            className="px-5 py-1.5 rounded-full text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Advanced
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Chart & Price OR Options Chain */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'options' ? (
            <OptionsChain 
              ticker={ticker.ticker}
              currentPrice={currentPrice || 0}
              selectedOption={selectedOption}
              onSelectOption={setSelectedOption}
              isLoading={isLoadingChart}
            />
          ) : (
            <>
              {/* Price Header */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {currentPrice ? formatPrice(currentPrice) : '--'}
                  </span>
                  <span className="text-xl text-gray-400 font-medium">USD</span>
                </div>
                {priceChange && (
                  <div className={`flex items-center gap-2 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="font-medium text-lg">
                      {isPositive ? '+' : ''}{formatPrice(priceChange.change)} ({priceChange.percent.toFixed(2)}%)
                    </span>
                    <span className="text-gray-400 text-sm font-medium">today</span>
                  </div>
                )}
              </div>

              {/* Chart Area */}
              <div className="h-[400px]">
                 {isLoadingChart ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111827', 
                          border: 'none', 
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        formatter={(value: number) => [formatPrice(value), 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={chartColor}
                        strokeWidth={2}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No chart data available
                  </div>
                )}
              </div>

              {/* Time Ranges */}
              <div className="flex gap-2">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`
                      px-4 py-2 text-xs font-bold rounded-lg transition-all
                      ${selectedRange === range 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-transparent text-gray-500 hover:bg-gray-50'
                      }
                    `}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              {/* Stats Grid */}
               <div className="grid grid-cols-4 gap-8 py-8 border-t border-gray-100">
                 <div>
                   <div className="text-sm text-gray-500 mb-1">Open</div>
                   <div className="font-bold">{chartData[0] ? formatPrice(chartData[0].value) : '--'}</div>
                 </div>
                 <div>
                   <div className="text-sm text-gray-500 mb-1">High</div>
                   <div className="font-bold">{chartData.length > 0 ? formatPrice(Math.max(...chartData.map(d => d.value))) : '--'}</div>
                 </div>
                 <div>
                   <div className="text-sm text-gray-500 mb-1">Low</div>
                   <div className="font-bold">{chartData.length > 0 ? formatPrice(Math.min(...chartData.map(d => d.value))) : '--'}</div>
                 </div>
                 <div>
                   <div className="text-sm text-gray-500 mb-1">Vol</div>
                   <div className="font-bold">24.5M</div>
                 </div>
               </div>
            </>
          )}
        </div>

        {/* Right: Trading Panel */}
        <div className="lg:col-span-4">
            {activeTab === 'options' ? (
              <OptionsOrderTicket 
                 ticker={ticker.ticker}
                 currentPrice={currentPrice || 0}
                 selectedOption={selectedOption}
                 accountBalance={paperBalance}
                 onClose={() => {}}
              />
            ) : showSuccess ? (
              <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 sticky top-6">
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Order Placed</h3>
                  <p className="text-gray-500 mt-2">Your order has been queued.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 sticky top-6">
                <div className="space-y-6">
                  {/* Buy/Sell Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button 
                      onClick={() => setOrderSide('buy')}
                      className={`flex-1 pb-4 font-bold text-sm relative transition-colors ${orderSide === 'buy' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Buy
                      {orderSide === 'buy' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />}
                    </button>
                    <button 
                      onClick={() => setOrderSide('sell')}
                      className={`flex-1 pb-4 font-bold text-sm relative transition-colors ${orderSide === 'sell' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Sell
                      {orderSide === 'sell' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />}
                    </button>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-4">
                    {/* Order Type */}
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-900 text-sm">Shares</label>
                      <div className="relative">
                        <select 
                          value={orderType}
                          onChange={(e) => setOrderType(e.target.value as any)}
                          className="appearance-none bg-gray-100 rounded-xl py-3 pl-4 pr-10 font-bold text-gray-900 text-right min-w-[140px] focus:outline-none cursor-pointer"
                        >
                          <option value="market">Market</option>
                          <option value="limit">Limit</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Buy In Type */}
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-900 text-sm">Shares</label>
                      <div className="relative">
                        <select 
                          value={buyIn}
                          onChange={(e) => setBuyIn(e.target.value as any)}
                          className="appearance-none bg-gray-100 rounded-xl py-3 pl-4 pr-10 font-bold text-gray-900 text-right min-w-[140px] focus:outline-none cursor-pointer"
                        >
                          <option value="shares">Amount</option>
                          <option value="dollars">Value</option>
                        </select>
                        <ArrowUpDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-900 text-sm">Shares</label>
                      <div className="relative w-[140px]">
                        {buyIn === 'dollars' && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 font-bold">$</span>
                        )}
                        <input 
                          type="number"
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={`w-full bg-gray-100 rounded-xl py-3 ${buyIn === 'dollars' ? 'pl-6' : 'pl-4'} pr-12 font-bold text-gray-900 text-right focus:outline-none`}
                        />
                        <button 
                           onClick={() => setAmount('100')}
                           className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold shadow-sm"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    
                    {buyIn === 'shares' && (
                       <div className="text-right text-xs text-gray-400 font-medium">
                          {estimatedShares > 0 ? `${estimatedShares} shares` : '2 shares'}
                       </div>
                    )}
                  </div>
                  
                  <div className="h-px bg-gray-100" />

                  {/* Estimated Cost */}
                  <div className="flex justify-between items-center py-2">
                     <span className="font-bold text-gray-900">Estimated cost</span>
                     <span className="font-bold text-gray-900">{formatPrice(estimatedCost)} USD</span>
                  </div>

                  {/* Account Selection (Bottom) */}
                  <div className="bg-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-sm text-gray-900">Paper Trading</span>
                          <MiniSantaHat className="w-3 h-3" />
                        </div>
                        <div className="text-xs text-gray-500">{formatPrice(paperBalance)} • Competition</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={handleTrade}
                    disabled={!isValidTrade || isSubmitting}
                    className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'Next'}
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailView;
