// Massive API Service
// Documentation: https://massive.com/docs
// Free tier: 5 API calls/minute - we need to be careful!

const API_BASE_URL = 'https://api.massive.com';
const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY;

// Simple rate limiting - track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 12000; // 12 seconds between requests (5 per minute = 12s each)

// Simple cache to avoid repeat requests
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

interface ApiOptions {
  endpoint: string;
  params?: Record<string, string>;
}

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms before next request...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

async function apiRequest<T>({ endpoint, params = {} }: ApiOptions): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const cacheKey = url.toString();
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached response for:', endpoint);
    return cached.data as T;
  }

  // Wait for rate limit
  await waitForRateLimit();

  console.log('API Request:', endpoint);
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 429) {
    console.warn('Rate limited! Waiting 60 seconds...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    // Retry once
    return apiRequest({ endpoint, params });
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache the response
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

// ============ TYPES ============

export interface Ticker {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
}

export interface TickerSearchResponse {
  results: Ticker[];
  status: string;
  request_id: string;
  count: number;
  next_url?: string;
}

export interface StockQuote {
  ticker: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap: number;
  timestamp: number;
  transactions: number;
}

export interface AggregateBar {
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v: number;  // volume
  vw: number; // volume weighted average price
  t: number;  // timestamp (Unix ms)
  n: number;  // number of transactions
}

export interface AggregatesResponse {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: AggregateBar[];
  status: string;
  request_id: string;
}

export interface OptionContract {
  ticker: string;
  underlying_ticker: string;
  contract_type: 'call' | 'put';
  expiration_date: string;
  strike_price: number;
  shares_per_contract: number;
  primary_exchange: string;
  exercise_style: string;
}

export interface OptionsChainResponse {
  results: OptionContract[];
  status: string;
  request_id: string;
  next_url?: string;
}

export interface OptionQuote {
  ticker: string;
  day: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    vwap: number;
  };
  underlying_asset: {
    ticker: string;
    price: number;
    change_to_break_even: number;
  };
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  implied_volatility?: number;
  open_interest?: number;
}

export interface PreviousClose {
  ticker: string;
  results: Array<{
    T: string;   // ticker
    c: number;   // close
    h: number;   // high
    l: number;   // low
    o: number;   // open
    v: number;   // volume
    vw: number;  // vwap
    t: number;   // timestamp
  }>;
  status: string;
  request_id: string;
}

// ============ STOCK ENDPOINTS ============

/**
 * Search for stock tickers
 */
export async function searchTickers(query: string, limit = 10): Promise<TickerSearchResponse> {
  return apiRequest<TickerSearchResponse>({
    endpoint: '/v3/reference/tickers',
    params: {
      search: query,
      market: 'stocks',
      active: 'true',
      order: 'asc',
      limit: limit.toString(),
      sort: 'ticker',
    },
  });
}

/**
 * List tickers with optional filtering
 */
export async function listTickers(ticker?: string, limit = 100): Promise<TickerSearchResponse> {
  return apiRequest<TickerSearchResponse>({
    endpoint: '/v3/reference/tickers',
    params: {
      ticker: ticker || '',
      market: 'stocks',
      active: 'true',
      order: 'asc',
      limit: limit.toString(),
      sort: 'ticker',
    },
  });
}

/**
 * Get ticker details
 */
export async function getTickerDetails(ticker: string): Promise<{ results: Ticker }> {
  return apiRequest<{ results: Ticker }>({
    endpoint: `/v3/reference/tickers/${ticker}`,
  });
}

/**
 * Get previous day's close for a stock
 */
export async function getPreviousClose(ticker: string): Promise<PreviousClose> {
  return apiRequest<PreviousClose>({
    endpoint: `/v2/aggs/ticker/${ticker}/prev`,
  });
}

/**
 * Get aggregate bars (candlestick data) for a stock
 * @param ticker - Stock ticker symbol
 * @param multiplier - Size of the timespan multiplier
 * @param timespan - 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
 * @param from - Start date (YYYY-MM-DD)
 * @param to - End date (YYYY-MM-DD)
 */
export async function getAggregates(
  ticker: string,
  multiplier: number,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
  from: string,
  to: string,
  limit = 120 // Reduced limit for smaller responses
): Promise<AggregatesResponse> {
  return apiRequest<AggregatesResponse>({
    endpoint: `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
    params: {
      adjusted: 'true',
      sort: 'asc',
      limit: limit.toString(),
    },
  });
}

// ============ OPTIONS ENDPOINTS ============

/**
 * Get options contracts for an underlying ticker
 */
export async function getOptionsContracts(
  underlyingTicker: string,
  contractType?: 'call' | 'put',
  expirationDateGte?: string,
  limit = 20
): Promise<OptionsChainResponse> {
  const params: Record<string, string> = {
    underlying_ticker: underlyingTicker,
    limit: limit.toString(),
    order: 'asc',
    sort: 'expiration_date',
  };

  if (contractType) {
    params.contract_type = contractType;
  }

  if (expirationDateGte) {
    params['expiration_date.gte'] = expirationDateGte;
  }

  return apiRequest<OptionsChainResponse>({
    endpoint: '/v3/reference/options/contracts',
    params,
  });
}

/**
 * Get a snapshot quote for an options contract
 */
export async function getOptionSnapshot(optionTicker: string): Promise<{ results: OptionQuote }> {
  return apiRequest<{ results: OptionQuote }>({
    endpoint: `/v3/snapshot/options/${optionTicker}`,
  });
}

/**
 * Get options aggregates (historical data)
 */
export async function getOptionsAggregates(
  optionTicker: string,
  multiplier: number,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month',
  from: string,
  to: string
): Promise<AggregatesResponse> {
  return apiRequest<AggregatesResponse>({
    endpoint: `/v2/aggs/ticker/${optionTicker}/range/${multiplier}/${timespan}/${from}/${to}`,
    params: {
      adjusted: 'true',
      sort: 'asc',
    },
  });
}

// ============ HELPERS ============

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range based on time range selection
 */
export function getDateRange(range: '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '2Y'): { from: string; to: string } {
  const to = new Date();
  const from = new Date();

  switch (range) {
    case '1D':
      from.setDate(from.getDate() - 1);
      break;
    case '1W':
      from.setDate(from.getDate() - 7);
      break;
    case '1M':
      from.setMonth(from.getMonth() - 1);
      break;
    case '3M':
      from.setMonth(from.getMonth() - 3);
      break;
    case '6M':
      from.setMonth(from.getMonth() - 6);
      break;
    case 'YTD':
      from.setMonth(0);
      from.setDate(1);
      break;
    case '1Y':
      from.setFullYear(from.getFullYear() - 1);
      break;
    case '2Y':
      from.setFullYear(from.getFullYear() - 2);
      break;
  }

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

/**
 * Calculate price change and percentage
 */
export function calculateChange(currentPrice: number, previousClose: number): { change: number; changePercent: number } {
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  return { change, changePercent };
}

/**
 * Clear the API cache
 */
export function clearCache(): void {
  cache.clear();
}
