export interface Holding {
  id: string;
  ticker: string;
  name?: string;
  shares: number;
  value: number;
  change: number;
  changePercent: number;
  iconBg: string;
  averageCost?: number;
  currentPrice?: number;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance?: number; // Optional because we might mask it
  isGrouped?: boolean;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL';

export interface ChartDataPoint {
  time: string;
  value: number;
}

// Stock types for Massive API
export interface StockData {
  ticker: string;
  name: string;
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface OptionData {
  ticker: string;
  underlyingTicker: string;
  contractType: 'call' | 'put';
  expirationDate: string;
  strikePrice: number;
  lastPrice?: number;
  bid?: number;
  ask?: number;
  volume?: number;
  openInterest?: number;
  impliedVolatility?: number;
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
}

export interface PaperTrade {
  id: string;
  ticker: string;
  name: string;
  type: 'stock' | 'option';
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: Date;
  optionDetails?: {
    contractType: 'call' | 'put';
    strikePrice: number;
    expirationDate: string;
  };
}

export interface PaperPortfolio {
  cash: number;
  holdings: Holding[];
  trades: PaperTrade[];
  totalValue: number;
}

// Leaderboard types
export type LeaderboardViewMode = 'OVERALL' | 'DAILY';

export interface LeaderboardUser {
  id: string;
  name: string;
  percentUp: number;
  moneyUp: number;
  rank: number;
  category: string;
  avatar: string;
  isCurrentUser: boolean;
  trend: 'up' | 'down' | 'same';
}

export interface DailyPrize {
  day: string;
  title?: string;
  description?: string;
  amount?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  username: string;
  created_at?: string;
}
