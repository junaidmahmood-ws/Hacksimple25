import React, { useState, useEffect } from 'react';
import PortfolioChart from './PortfolioChart';
import StockDetailView from './StockDetailView';
import TradeModal from './TradeModal';
import Leaderboard, { getCurrentUserRank } from './leaderboard';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Ghost,
  Trophy,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { MiniSantaHat, SnowDrift } from './ChristmasDecorations';
import { ChartDataPoint, TimeRange, Holding, PaperTrade, PaperPortfolio } from '../types';
import { Ticker, OptionContract } from '../services/massiveApi';
import { getCurrentUser } from '../services/authService';
import { 
  getPortfolio, 
  placeOrder, 
  resetPaperTradingAccount,
  getTradeHistory,
  refreshPortfolioPrices,
  getPortfolioHistory
} from '../services/paperTradingService';

interface PaperTradingDashboardProps {
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  setIsPaperTrading: (isPaper: boolean) => void;
  timeRanges: TimeRange[];
  initialTicker?: Ticker | null;
  onTickerConsumed?: () => void;
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
  timeRanges,
  initialTicker,
  onTickerConsumed
}) => {
  const currentUser = getCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Portfolio state - synced with Supabase
  const [portfolio, setPortfolio] = useState<PaperPortfolio>({
    cash: INITIAL_BALANCE,
    holdings: [],
    trades: [],
    totalValue: INITIAL_BALANCE
  });

  // View state
  const [selectedTicker, setSelectedTicker] = useState<Ticker | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeModalData, setTradeModalData] = useState<{
    ticker: string;
    name: string;
    price: number;
    type: 'stock' | 'option';
    optionContract?: OptionContract;
  } | null>(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userLeaderboardRank, setUserLeaderboardRank] = useState<number | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Load portfolio from Supabase on mount and refresh prices
  useEffect(() => {
    const loadPortfolioAndRefreshPrices = async () => {
      if (!currentUser || !currentUser.username) {
        setIsLoading(false);
        // Fall back to localStorage if no user
        const saved = localStorage.getItem('paperPortfolio');
        if (saved) {
          try {
            setPortfolio(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse saved portfolio:', e);
          }
        }
        return;
      }
      
      try {
        // First load the portfolio data
        const portfolioData = await getPortfolio(currentUser.username);
        if (portfolioData) {
          setPortfolio(portfolioData);
        }
        
        setIsLoading(false);
        
        // Then refresh prices in the background (this may take a while due to rate limiting)
        setIsRefreshingPrices(true);
        console.log('Refreshing stock prices...');
        
        const refreshResult = await refreshPortfolioPrices(currentUser.username);
        
        if (refreshResult.success && refreshResult.updatedPositions) {
          // Update portfolio with new prices
          setPortfolio(prev => ({
            ...prev,
            holdings: refreshResult.updatedPositions || prev.holdings,
            totalValue: refreshResult.totalValue ?? prev.totalValue
          }));
          console.log('Prices refreshed successfully');
        }
        
        // Load chart data (portfolio history)
        const history = await getPortfolioHistory(currentUser.username);
        if (history.length > 0) {
          setChartData(history);
        }
        
      } catch (error) {
        console.error('Failed to load portfolio:', error);
        // Fall back to localStorage if Supabase fails
        const saved = localStorage.getItem('paperPortfolio');
        if (saved) {
          try {
            setPortfolio(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse saved portfolio:', e);
          }
        }
      } finally {
        setIsLoading(false);
        setIsRefreshingPrices(false);
      }
    };
    
    loadPortfolioAndRefreshPrices();
  }, [currentUser?.username]);

  // Also save to localStorage as backup
  useEffect(() => {
    localStorage.setItem('paperPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Fetch user's leaderboard rank
  useEffect(() => {
    const fetchRank = async () => {
      const rank = await getCurrentUserRank('General');
      setUserLeaderboardRank(rank);
    };
    fetchRank();
  }, []);

  // Handle initial ticker from header search
  useEffect(() => {
    if (initialTicker) {
      setSelectedTicker(initialTicker);
      if (onTickerConsumed) {
        onTickerConsumed();
      }
    }
  }, [initialTicker, onTickerConsumed]);

  // Calculate total portfolio value
  const totalValue = portfolio.cash + portfolio.holdings.reduce((sum, h) => sum + h.value, 0);
  const totalChange = totalValue - INITIAL_BALANCE;
  const totalChangePercent = (totalChange / INITIAL_BALANCE) * 100;

  // Handle stock selection from search
  const handleSelectStock = (ticker: Ticker) => {
    setSelectedTicker(ticker);
  };

  // Handle opening trade modal
  const handleOpenTrade = (ticker: string, name: string, price: number, type: 'stock' | 'option', optionContract?: OptionContract) => {
    setTradeModalData({ ticker, name, price, type, optionContract });
    setShowTradeModal(true);
  };

  // Handle executing a trade - save to Supabase
  const handleExecuteTrade = async (trade: PaperTrade) => {
    if (!currentUser || !currentUser.username) {
      console.error('No user logged in or username missing');
      alert('Please log in to place trades');
      return;
    }

    // Place order in Supabase
    const result = await placeOrder(currentUser.username, {
      ticker: trade.ticker,
      name: trade.name,
      side: trade.action,
      quantity: trade.quantity,
      price: trade.price,
      orderType: trade.type,
      optionDetails: trade.optionDetails
    });

    if (!result.success) {
      console.error('Failed to place order:', result.error);
      alert(result.error || 'Failed to place order');
      return;
    }

    // Update local state optimistically
    setPortfolio(prev => {
      let newCash = prev.cash;
      let newHoldings = [...prev.holdings];

      if (trade.action === 'buy') {
        newCash -= trade.totalValue;
        
        // Check if we already have this holding
        const existingIndex = newHoldings.findIndex(h => h.ticker === trade.ticker);
        if (existingIndex >= 0) {
          const existing = newHoldings[existingIndex];
          const newShares = existing.shares + trade.quantity;
          const newValue = existing.value + trade.totalValue;
          newHoldings[existingIndex] = {
            ...existing,
            shares: newShares,
            value: newValue,
            averageCost: newValue / newShares,
            currentPrice: trade.price
          };
        } else {
          newHoldings.push({
            id: `holding-${Date.now()}`,
            ticker: trade.ticker,
            name: trade.name,
            shares: trade.quantity,
            value: trade.totalValue,
            change: 0,
            changePercent: 0,
            iconBg: getRandomColor(),
            averageCost: trade.price,
            currentPrice: trade.price
          });
        }
      } else {
        // Sell
        newCash += trade.totalValue;
        
        const existingIndex = newHoldings.findIndex(h => h.ticker === trade.ticker);
        if (existingIndex >= 0) {
          const existing = newHoldings[existingIndex];
          const newShares = existing.shares - trade.quantity;
          if (newShares <= 0) {
            newHoldings.splice(existingIndex, 1);
          } else {
            newHoldings[existingIndex] = {
              ...existing,
              shares: newShares,
              value: newShares * trade.price
            };
          }
        }
      }

      return {
        ...prev,
        cash: newCash,
        holdings: newHoldings,
        trades: [...prev.trades, trade],
        totalValue: newCash + newHoldings.reduce((sum, h) => sum + h.value, 0)
      };
    });

    // After placing an order, return to the homepage view
    setSelectedTicker(null);
    setShowTradeModal(false);
  };

  // Reset portfolio - also reset in Supabase
  const handleResetPortfolio = async () => {
    if (confirm('Are you sure you want to reset your paper trading portfolio? This will clear all holdings and trades.')) {
      if (currentUser && currentUser.username) {
        await resetPaperTradingAccount(currentUser.username);
      }
      setPortfolio({
        cash: INITIAL_BALANCE,
        holdings: [],
        trades: [],
        totalValue: INITIAL_BALANCE
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // If a stock is selected, show the detail view
  if (selectedTicker) {
    return (
      <>
        <StockDetailView 
          ticker={selectedTicker}
          onBack={() => setSelectedTicker(null)}
          onExecuteTrade={handleExecuteTrade}
          onOptionTrade={handleOpenTrade}
          paperBalance={portfolio.cash}
        />
        <TradeModal 
          isOpen={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          ticker={tradeModalData?.ticker}
          tickerName={tradeModalData?.name}
          currentPrice={tradeModalData?.price}
          tradeType={tradeModalData?.type}
          optionContract={tradeModalData?.optionContract}
          paperBalance={portfolio.cash}
          onExecuteTrade={handleExecuteTrade}
        />
        <TradeModal 
          isOpen={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          ticker={tradeModalData?.ticker}
          tickerName={tradeModalData?.name}
          currentPrice={tradeModalData?.price}
          tradeType={tradeModalData?.type}
          optionContract={tradeModalData?.optionContract}
          paperBalance={portfolio.cash}
          onExecuteTrade={handleExecuteTrade}
        />
      </>
    );
  }

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  return (
    <>
      <TradeModal 
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        ticker={tradeModalData?.ticker}
        tickerName={tradeModalData?.name}
        currentPrice={tradeModalData?.price}
        tradeType={tradeModalData?.type}
        optionContract={tradeModalData?.optionContract}
        paperBalance={portfolio.cash}
        onExecuteTrade={handleExecuteTrade}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Total Balance Header */}
          <div className="flex items-center gap-4 relative">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 relative ml-4 flex items-center gap-3">
               <>
                  {balanceVisible ? formatCurrency(totalValue) : '$• • • • • • • •'}
                  {isRefreshingPrices && (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" title="Refreshing prices..." />
                  )}
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

          {/* P&L Display */}
          {totalChange !== 0 && (
            <div className={`flex items-center gap-2 ml-4 ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-semibold">
                {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} ({totalChangePercent.toFixed(2)}%)
              </span>
              <span className="text-gray-400 text-sm">all time</span>
            </div>
          )}

          {/* Chart Section */}
          <div className="relative">
            <PortfolioChart 
              data={chartData.length > 0 
                ? chartData
                : portfolio.trades.length > 0 
                  ? portfolio.trades.map((t, i) => ({
                      time: new Date(t.timestamp).toLocaleDateString(),
                      value: portfolio.trades.slice(0, i + 1).reduce((sum, tr) => 
                        sum + (tr.action === 'buy' ? -tr.totalValue : tr.totalValue), INITIAL_BALANCE
                      )
                    }))
                  : Array.from({ length: 30 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (30 - i));
                      return { time: date.toISOString().split('T')[0], value: INITIAL_BALANCE };
                    })
              } 
            />
            
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
              <button 
                onClick={handleResetPortfolio}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-200"
              >
                Reset Portfolio
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
               <div className="flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer">
                 <div>
                   <div className="font-bold text-gray-900">Paper Trading</div>
                   <div className="text-sm text-gray-500 mt-0.5">Competition Account</div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="text-right">
                     <span className="font-bold text-lg tracking-wider block">
                       {balanceVisible ? formatCurrency(totalValue) : '$••••••'}
                     </span>
                     <span className="text-xs text-gray-500">
                       Cash: {formatCurrency(portfolio.cash)}
                     </span>
                   </div>
                   <ChevronDown className="w-4 h-4 text-gray-400" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button 
               onClick={() => setShowLeaderboard(true)}
               className="col-span-2 flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group"
            >
               <SnowDrift className="w-full" />
               <div className="w-8 h-8 rounded-full border border-gray-900 flex items-center justify-center relative z-10 group-hover:bg-red-50 transition-colors">
                 <Trophy className="w-4 h-4" />
               </div>
               <span className="text-sm font-bold relative z-10">
                 View leaderboard{userLeaderboardRank ? ` • You’re #${userLeaderboardRank}` : ''}
               </span>
            </button>
          </div>

          {/* Holdings Widget */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2">
            <div className="flex items-center justify-between p-3 border-b border-gray-50 mb-2">
              <div className="flex gap-4 text-sm font-bold">
                <span className="text-gray-900 cursor-pointer">Holdings</span>
                <span className="text-gray-400 cursor-pointer hover:text-gray-600">Watchlist</span>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto pr-1">
              {portfolio.holdings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Ghost className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="font-bold text-gray-900">No holdings yet</h3>
                   <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Search for a stock above to start trading.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {portfolio.holdings.map((holding) => (
                    <div 
                      key={holding.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${holding.iconBg} flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">{holding.ticker.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{holding.ticker}</div>
                          <div className="text-xs text-gray-500">{holding.shares.toFixed(4)} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(holding.value)}</div>
                        <div className={`text-xs ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.change >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Trades */}
          {portfolio.trades.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">Recent Trades</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {portfolio.trades.slice(-5).reverse().map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        trade.action === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.action.toUpperCase()}
                      </span>
                      <span className="font-semibold text-sm">{trade.ticker}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatCurrency(trade.totalValue)}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaperTradingDashboard;
