export interface Holding {
  id: string;
  ticker: string;
  name?: string;
  shares: number;
  value: number;
  change: number;
  changePercent: number;
  iconBg: string;
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
