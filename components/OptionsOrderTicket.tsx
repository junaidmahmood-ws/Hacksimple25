import React, { useState, useEffect } from 'react';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { MockOption } from './OptionsChain';

interface OptionsOrderTicketProps {
  ticker: string;
  currentPrice: number;
  selectedOption: MockOption | null;
  onClose: () => void;
  accountBalance?: number;
}

export const OptionsOrderTicket: React.FC<OptionsOrderTicketProps> = ({
  ticker,
  currentPrice,
  selectedOption,
  onClose,
  accountBalance
}) => {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('Limit');
  const [limitPrice, setLimitPrice] = useState('1.55');
  const [expires, setExpires] = useState('Today at 4:00 pm');

  // Update limit price when option changes (use ask price for buying)
  useEffect(() => {
    if (selectedOption) {
      setLimitPrice(selectedOption.ask.toFixed(2));
    }
  }, [selectedOption]);

  if (!selectedOption) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Plus className="w-5 h-5 text-gray-300" />
        </div>
        <p className="text-gray-400 text-sm">Select an option to trade</p>
      </div>
    );
  }

  const isCall = selectedOption.contract_type === 'call';
  const totalCost = parseFloat(limitPrice) * quantity * 100; // Options are per 100 shares

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
          {ticker} {isCall ? 'LONG CALL' : 'LONG PUT'}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M7 7l10 10" />
          </svg>
        </button>
      </div>

      {/* Contract Card */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between gap-3">
          {/* Buy Badge */}
          <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">
            Buy
          </span>

          {/* Contract Details */}
          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-gray-900">
              {new Date(selectedOption.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${selectedOption.strike_price.toFixed(0)} {isCall ? 'Call' : 'Put'}
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-gray-400 hover:text-gray-600 border-r border-gray-100"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 text-sm font-semibold text-gray-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-gray-400 hover:text-gray-600 border-l border-gray-100"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Order Type */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">Order type</label>
          <div className="relative">
            <select 
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="appearance-none bg-transparent pr-6 text-sm font-semibold text-gray-900 text-right focus:outline-none cursor-pointer"
            >
              <option>Limit</option>
              <option>Market</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Limit Price */}
        {orderType === 'Limit' && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">Limit price</label>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm font-semibold text-gray-900">$</span>
                <input 
                  type="text"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-16 text-sm font-semibold text-gray-900 text-right focus:outline-none bg-transparent border-b border-gray-200 focus:border-gray-900"
                />
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Ask: ${selectedOption.ask.toFixed(2)} · Mid: ${selectedOption.mid.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Contracts Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Contracts</span>
          <span className="font-semibold text-gray-900">{quantity} × 100 shares</span>
        </div>

        {/* Total Cost */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Total Cost</span>
          <span className="text-lg font-bold text-gray-900">${totalCost.toFixed(2)}</span>
        </div>

        {/* Expires */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">Expires</label>
          <div className="relative">
            <select 
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="appearance-none bg-transparent pr-6 text-sm font-semibold text-gray-900 text-right focus:outline-none cursor-pointer"
            >
              <option>Today at 4:00 pm</option>
              <option>Good till cancelled</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Buy Button */}
        <button className="w-full py-3.5 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors">
          Buy {isCall ? 'Call' : 'Put'}
        </button>

        {/* Account */}
        <div className="flex items-center justify-between pt-2">
          <label className="text-sm font-semibold text-gray-900">Account</label>
          <div className="relative">
            <select 
              className="appearance-none bg-transparent pr-6 text-sm text-gray-400 text-right focus:outline-none cursor-pointer"
            >
              <option>Select an account</option>
              <option>Paper Trading</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
