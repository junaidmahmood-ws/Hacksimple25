import { supabase } from './supabase';
import { getCurrentUser } from './authService';
import { PaperTrade, Holding, PaperPortfolio } from '../types';
import { getPreviousClose } from './massiveApi';

const INITIAL_BALANCE = 10000;

// ==========================================
// PORTFOLIO OPERATIONS
// ==========================================

/**
 * Initialize a user's paper trading account with starting balance
 */
export async function initializePaperTradingAccount(username: string, category: 'Student' | 'Advanced' = 'Student'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        'Total Value': INITIAL_BALANCE,
        'Percent Gain': 0,
        'Amount Gained': 0,
        'Category': category,
      })
      .eq('username', username);

    if (error) {
      console.error('Failed to initialize paper trading account:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize paper trading account:', error);
    return false;
  }
}

/**
 * Get user's paper trading portfolio from Supabase
 */
export async function getPortfolio(username: string): Promise<PaperPortfolio | null> {
  try {
    if (!username) {
      console.error('getPortfolio: username is required');
      return null;
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.error('Failed to get user data:', userError);
      return null;
    }

    // Get positions
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('username', username);

    if (positionsError) {
      console.error('Failed to get positions:', positionsError);
    }

    // Get trades
    const { data: trades, error: tradesError } = await supabase
      .from('orders')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (tradesError) {
      console.error('Failed to get trades:', tradesError);
    }

    // Calculate holdings value
    const holdingsValue = (positions || []).reduce((sum, p) => sum + (p.current_value || 0), 0);
    const totalValue = userData['Total Value'] ?? userData.total_value ?? INITIAL_BALANCE;
    const cash = userData.cash_balance ?? (totalValue - holdingsValue);

    // Transform positions to holdings format
    const holdings: Holding[] = (positions || []).map(p => ({
      id: p.id,
      ticker: p.ticker,
      name: p.name || p.ticker,
      shares: p.quantity,
      value: p.current_value || p.quantity * p.average_cost,
      change: (p.current_price - p.average_cost) * p.quantity,
      changePercent: ((p.current_price - p.average_cost) / p.average_cost) * 100,
      iconBg: p.icon_bg || 'bg-gray-600',
      averageCost: p.average_cost,
      currentPrice: p.current_price
    }));

    // Transform orders to trades format
    const paperTrades: PaperTrade[] = (trades || []).map(t => {
      let optionDetails = undefined;
      if (t.option_details) {
        try {
          optionDetails = typeof t.option_details === 'string' 
            ? JSON.parse(t.option_details) 
            : t.option_details;
        } catch (e) {
          console.error('Failed to parse option details:', e);
        }
      }
      return {
        id: t.id,
        ticker: t.ticker,
        name: t.name || t.ticker,
        type: t.order_type as 'stock' | 'option',
        action: t.side as 'buy' | 'sell',
        quantity: t.quantity,
        price: t.price,
        totalValue: t.total_value,
        timestamp: new Date(t.created_at),
        optionDetails
      };
    });

    return {
      cash,
      holdings,
      trades: paperTrades,
      totalValue: totalValue
    };
  } catch (error) {
    console.error('Failed to get portfolio:', error);
    return null;
  }
}

/**
 * Update user's total value and stats in Supabase
 */
export async function updateUserStats(username: string, totalValue: number): Promise<boolean> {
  try {
    const percentGain = ((totalValue - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;
    const amountGained = totalValue - INITIAL_BALANCE;

    const { error } = await supabase
      .from('users')
      .update({
        'Total Value': totalValue,
        'Percent Gain': percentGain,
        'Amount Gained': amountGained,
      })
      .eq('username', username);

    if (error) {
      console.error('Failed to update user stats:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update user stats:', error);
    return false;
  }
}

// ==========================================
// ORDER OPERATIONS
// ==========================================

/**
 * Place an order (buy or sell)
 */
export async function placeOrder(
  username: string,
  order: {
    ticker: string;
    name: string;
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    orderType: 'stock' | 'option';
    optionDetails?: {
      contractType: 'call' | 'put';
      strikePrice: number;
      expirationDate: string;
    };
  }
): Promise<{ success: boolean; trade?: PaperTrade; error?: string }> {
  try {
    const totalValue = order.quantity * order.price;

    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User not found' };
    }

    // Get current position for this ticker
    const { data: existingPosition } = await supabase
      .from('positions')
      .select('*')
      .eq('username', username)
      .eq('ticker', order.ticker)
      .single();

    // Calculate current cash (Total Value - sum of positions)
    const { data: allPositions } = await supabase
      .from('positions')
      .select('current_value')
      .eq('username', username);

    const positionsValue = (allPositions || []).reduce((sum, p) => sum + (p.current_value || 0), 0);
    const currentCash = (userData['Total Value'] ?? INITIAL_BALANCE) - positionsValue;

    if (order.side === 'buy') {
      // Check if user has enough cash
      if (currentCash < totalValue) {
        return { success: false, error: 'Insufficient funds' };
      }
    } else {
      // Check if user has enough shares to sell
      if (!existingPosition || existingPosition.quantity < order.quantity) {
        return { success: false, error: 'Insufficient shares' };
      }
    }

    // Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          username: username,
          ticker: order.ticker,
          name: order.name,
          side: order.side,
          quantity: order.quantity,
          price: order.price,
          total_value: totalValue,
          order_type: order.orderType,
          option_details: order.optionDetails ? JSON.stringify(order.optionDetails) : null,
          status: 'filled'
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Failed to insert order:', orderError);
      return { success: false, error: orderError.message };
    }

    // Update position
    if (order.side === 'buy') {
      if (existingPosition) {
        // Update existing position
        const newQuantity = existingPosition.quantity + order.quantity;
        const newTotalCost = (existingPosition.average_cost * existingPosition.quantity) + totalValue;
        const newAverageCost = newTotalCost / newQuantity;

        await supabase
          .from('positions')
          .update({
            quantity: newQuantity,
            average_cost: newAverageCost,
            current_price: order.price,
            current_value: newQuantity * order.price,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPosition.id);
      } else {
        // Create new position
        await supabase
          .from('positions')
          .insert([
            {
              username: username,
              ticker: order.ticker,
              name: order.name,
              quantity: order.quantity,
              average_cost: order.price,
              current_price: order.price,
              current_value: totalValue,
              icon_bg: getRandomColor()
            }
          ]);
      }
    } else {
      // Sell - reduce or remove position
      const newQuantity = existingPosition.quantity - order.quantity;
      if (newQuantity <= 0) {
        await supabase
          .from('positions')
          .delete()
          .eq('id', existingPosition.id);
      } else {
        await supabase
          .from('positions')
          .update({
            quantity: newQuantity,
            current_value: newQuantity * order.price,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPosition.id);
      }
    }

    // Recalculate and update user's total value
    const { data: updatedPositions } = await supabase
      .from('positions')
      .select('current_value')
      .eq('username', username);

    const newPositionsValue = (updatedPositions || []).reduce((sum, p) => sum + (p.current_value || 0), 0);
    const newCash = order.side === 'buy' ? currentCash - totalValue : currentCash + totalValue;
    const newTotalValue = newCash + newPositionsValue;

    await updateUserStats(username, newTotalValue);

    const trade: PaperTrade = {
      id: orderData.id,
      ticker: order.ticker,
      name: order.name,
      type: order.orderType,
      action: order.side,
      quantity: order.quantity,
      price: order.price,
      totalValue: totalValue,
      timestamp: new Date(orderData.created_at),
      optionDetails: order.optionDetails
    };

    return { success: true, trade };
  } catch (error) {
    console.error('Failed to place order:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ==========================================
// POSITION OPERATIONS
// ==========================================

/**
 * Get all positions for a user
 */
export async function getPositions(username: string): Promise<Holding[]> {
  try {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('username', username);

    if (error) {
      console.error('Failed to get positions:', error);
      return [];
    }

    return (data || []).map(p => ({
      id: p.id,
      ticker: p.ticker,
      name: p.name || p.ticker,
      shares: p.quantity,
      value: p.current_value || p.quantity * p.average_cost,
      change: (p.current_price - p.average_cost) * p.quantity,
      changePercent: ((p.current_price - p.average_cost) / p.average_cost) * 100,
      iconBg: p.icon_bg || 'bg-gray-600',
      averageCost: p.average_cost,
      currentPrice: p.current_price
    }));
  } catch (error) {
    console.error('Failed to get positions:', error);
    return [];
  }
}

/**
 * Update position prices (call this periodically to update current prices)
 */
export async function updatePositionPrice(
  positionId: string,
  currentPrice: number
): Promise<boolean> {
  try {
    const { data: position, error: getError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', positionId)
      .single();

    if (getError || !position) {
      return false;
    }

    const newValue = position.quantity * currentPrice;

    const { error } = await supabase
      .from('positions')
      .update({
        current_price: currentPrice,
        current_value: newValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', positionId);

    if (error) {
      console.error('Failed to update position price:', error);
      return false;
    }

    // Also update user's total value
    const { data: positionData } = await supabase
      .from('positions')
      .select('username')
      .eq('id', positionId)
      .single();

    if (positionData && positionData.username) {
      const { data: allPositions } = await supabase
        .from('positions')
        .select('current_value')
        .eq('username', positionData.username);

      const totalPositionsValue = (allPositions || []).reduce((sum, p) => sum + (p.current_value || 0), 0);
      
      // Get user's cash (Total Value - old positions value, then add new positions value)
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('username', positionData.username)
        .single();

      if (userData) {
        // Recalculate total value
        const newTotalValue = totalPositionsValue + (userData.cash_balance ?? (INITIAL_BALANCE - totalPositionsValue));
        await updateUserStats(positionData.username, newTotalValue);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to update position price:', error);
    return false;
  }
}

// ==========================================
// TRADE HISTORY
// ==========================================

/**
 * Get trade history for a user
 */
export async function getTradeHistory(username: string, limit: number = 50): Promise<PaperTrade[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get trade history:', error);
      return [];
    }

    return (data || []).map(t => ({
      id: t.id,
      ticker: t.ticker,
      name: t.name || t.ticker,
      type: t.order_type as 'stock' | 'option',
      action: t.side as 'buy' | 'sell',
      quantity: t.quantity,
      price: t.price,
      totalValue: t.total_value,
      timestamp: new Date(t.created_at),
      optionDetails: t.option_details ? JSON.parse(t.option_details) : undefined
    }));
  } catch (error) {
    console.error('Failed to get trade history:', error);
    return [];
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const iconColors = [
  'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 
  'bg-yellow-500', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600'
];

function getRandomColor(): string {
  return iconColors[Math.floor(Math.random() * iconColors.length)];
}

/**
 * Reset user's paper trading account
 */
export async function resetPaperTradingAccount(username: string): Promise<boolean> {
  try {
    // Delete all positions
    await supabase
      .from('positions')
      .delete()
      .eq('username', username);

    // Delete all orders
    await supabase
      .from('orders')
      .delete()
      .eq('username', username);

    // Reset user stats
    await supabase
      .from('users')
      .update({
        'Total Value': INITIAL_BALANCE,
        'Percent Gain': 0,
        'Amount Gained': 0,
      })
      .eq('username', username);

    return true;
  } catch (error) {
    console.error('Failed to reset paper trading account:', error);
    return false;
  }
}

// ==========================================
// PRICE UPDATE FUNCTIONS
// ==========================================

/**
 * Fetch current prices for all positions and update portfolio value
 * Call this on page load to get the latest prices
 */
export async function refreshPortfolioPrices(username: string): Promise<{
  success: boolean;
  updatedPositions?: Holding[];
  totalValue?: number;
  percentGain?: number;
  amountGained?: number;
}> {
  try {
    if (!username) {
      return { success: false };
    }

    // Get all positions for the user
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('username', username);

    if (positionsError || !positions || positions.length === 0) {
      // No positions to update
      return { success: true, updatedPositions: [], totalValue: INITIAL_BALANCE, percentGain: 0, amountGained: 0 };
    }

    // Fetch current prices for each unique ticker
    const uniqueTickers = [...new Set(positions.map(p => p.ticker))];
    const priceUpdates: Record<string, number> = {};
    
    console.log(`Refreshing prices for ${uniqueTickers.length} tickers...`);

    for (const ticker of uniqueTickers) {
      try {
        const priceData = await getPreviousClose(ticker);
        if (priceData?.results?.[0]?.c) {
          priceUpdates[ticker] = priceData.results[0].c;
          console.log(`${ticker}: $${priceData.results[0].c}`);
        }
      } catch (err) {
        console.error(`Failed to fetch price for ${ticker}:`, err);
        // Keep the existing price if we can't fetch new one
      }
    }

    // Update each position with new price
    let totalPositionsValue = 0;
    const updatedPositions: Holding[] = [];

    for (const position of positions) {
      const newPrice = priceUpdates[position.ticker] || position.current_price || position.average_cost;
      const newValue = position.quantity * newPrice;
      const change = (newPrice - position.average_cost) * position.quantity;
      const changePercent = position.average_cost > 0 
        ? ((newPrice - position.average_cost) / position.average_cost) * 100 
        : 0;

      // Update position in database
      await supabase
        .from('positions')
        .update({
          current_price: newPrice,
          current_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', position.id);

      totalPositionsValue += newValue;

      updatedPositions.push({
        id: position.id,
        ticker: position.ticker,
        name: position.name || position.ticker,
        shares: position.quantity,
        value: newValue,
        change,
        changePercent,
        iconBg: position.icon_bg || 'bg-gray-600',
        averageCost: position.average_cost,
        currentPrice: newPrice
      });
    }

    // Get user's cash balance (Total Value - positions value from before update)
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    // Calculate cash as: previous total - old positions value
    // This is a simplification - ideally we'd track cash separately
    const oldPositionsValue = positions.reduce((sum, p) => sum + (p.current_value || 0), 0);
    const previousTotal = userData?.['Total Value'] ?? INITIAL_BALANCE;
    const cash = previousTotal - oldPositionsValue;
    
    // New total value
    const totalValue = cash + totalPositionsValue;
    const percentGain = ((totalValue - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;
    const amountGained = totalValue - INITIAL_BALANCE;

    // Update user stats
    await supabase
      .from('users')
      .update({
        'Total Value': totalValue,
        'Percent Gain': percentGain,
        'Amount Gained': amountGained,
      })
      .eq('username', username);

    console.log(`Portfolio updated: Total Value = $${totalValue.toFixed(2)}, Gain = ${percentGain.toFixed(2)}%`);

    return {
      success: true,
      updatedPositions,
      totalValue,
      percentGain,
      amountGained
    };
  } catch (error) {
    console.error('Failed to refresh portfolio prices:', error);
    return { success: false };
  }
}

/**
 * Get portfolio value history for charting
 * Returns the portfolio value snapshots over time based on trades
 */
export async function getPortfolioHistory(username: string): Promise<Array<{ time: string; value: number }>> {
  try {
    // Get all orders ordered by date
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: true });

    if (error || !orders || orders.length === 0) {
      // Return flat line at initial balance if no trades
      const now = new Date();
      const history = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        history.push({
          time: date.toISOString().split('T')[0],
          value: INITIAL_BALANCE
        });
      }
      return history;
    }

    // Build value history from trades
    const history: Array<{ time: string; value: number }> = [];
    let runningCash = INITIAL_BALANCE;
    const positionsMap: Record<string, { quantity: number; avgCost: number }> = {};

    // Add starting point
    const startDate = new Date(orders[0].created_at);
    startDate.setDate(startDate.getDate() - 1);
    history.push({
      time: startDate.toISOString().split('T')[0],
      value: INITIAL_BALANCE
    });

    for (const order of orders) {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      
      if (order.side === 'buy') {
        runningCash -= order.total_value;
        
        if (!positionsMap[order.ticker]) {
          positionsMap[order.ticker] = { quantity: 0, avgCost: 0 };
        }
        const pos = positionsMap[order.ticker];
        const newTotalCost = (pos.quantity * pos.avgCost) + order.total_value;
        pos.quantity += order.quantity;
        pos.avgCost = pos.quantity > 0 ? newTotalCost / pos.quantity : 0;
      } else {
        runningCash += order.total_value;
        
        if (positionsMap[order.ticker]) {
          positionsMap[order.ticker].quantity -= order.quantity;
          if (positionsMap[order.ticker].quantity <= 0) {
            delete positionsMap[order.ticker];
          }
        }
      }

      // Estimate positions value (use order price as estimate)
      let positionsValue = 0;
      for (const ticker of Object.keys(positionsMap)) {
        positionsValue += positionsMap[ticker].quantity * positionsMap[ticker].avgCost;
      }

      history.push({
        time: date,
        value: runningCash + positionsValue
      });
    }

    // Add current point
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userData) {
      history.push({
        time: new Date().toISOString().split('T')[0],
        value: userData['Total Value'] ?? INITIAL_BALANCE
      });
    }

    return history;
  } catch (error) {
    console.error('Failed to get portfolio history:', error);
    return [];
  }
}

