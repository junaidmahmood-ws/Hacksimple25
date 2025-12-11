import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, X, TrendingUp, TrendingDown } from 'lucide-react';
import { MiniSantaHat } from './ChristmasDecorations';
import { OptionContract } from '../services/massiveApi';
import { PaperTrade } from '../types';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker?: string;
  tickerName?: string;
  currentPrice?: number;
  tradeType?: 'stock' | 'option';
  optionContract?: OptionContract;
  paperBalance: number;
  onExecuteTrade: (trade: PaperTrade) => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ 
  isOpen, 
  onClose,
  ticker = 'TSLA',
  tickerName = 'Tesla Inc',
  currentPrice = 0,
  tradeType = 'stock',
  optionContract,
  paperBalance,
  onExecuteTrade
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [buyIn, setBuyIn] = useState<'dollars' | 'shares'>('dollars');
  const [amount, setAmount] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('100');
      setActiveTab('buy');
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amount) || 0;
  const price = optionContract ? (optionContract.strike_price * 100) : currentPrice; // Options are priced per 100 shares
  
  // Calculate shares/contracts
  const estimatedShares = buyIn === 'dollars' && price > 0 
    ? numericAmount / price 
    : numericAmount;
  
  const estimatedCost = buyIn === 'dollars' 
    ? numericAmount 
    : numericAmount * price;

  const canAfford = estimatedCost <= paperBalance;
  const isValidTrade = numericAmount > 0 && (activeTab === 'sell' || canAfford);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const handleSubmit = async () => {
    if (!isValidTrade) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const trade: PaperTrade = {
      id: `trade-${Date.now()}`,
      ticker: optionContract?.ticker || ticker,
      name: tickerName,
      type: tradeType,
      action: activeTab,
      quantity: buyIn === 'shares' ? numericAmount : estimatedShares,
      price: price,
      totalValue: estimatedCost,
      timestamp: new Date(),
      ...(optionContract && {
        optionDetails: {
          contractType: optionContract.contract_type,
          strikePrice: optionContract.strike_price,
          expirationDate: optionContract.expiration_date,
        }
      })
    };
    
    onExecuteTrade(trade);
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Close after showing success
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-gray-100 sm:rounded-3xl rounded-t-3xl w-full max-w-md overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
        
        {/* Header / Tabs */}
        <div className="bg-white px-6 pt-6 pb-2 rounded-t-3xl z-20 relative">
            <button onClick={onClose} className="absolute top-6 left-6 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-black" />
            </button>
            
            <div className="flex justify-center mb-6">
                <h2 className="font-medium text-[17px] text-black">TSLA</h2>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500">
              {activeTab === 'buy' ? 'Bought' : 'Sold'} {estimatedShares.toFixed(4)} {tradeType === 'option' ? 'contracts' : 'shares'} of {ticker}
            </p>
          </div>
        ) : (
          <>
            {/* Header / Tabs */}
            <div className="bg-white px-6 pt-6 pb-2 rounded-t-3xl shadow-sm z-20 relative">
              <button onClick={onClose} className="absolute top-6 left-6 p-1 rounded-full hover:bg-gray-100">
                <X className="w-6 h-6 text-gray-900" />
              </button>
              
              <div className="flex flex-col items-center mb-6">
                <h2 className="font-bold text-lg">{ticker}</h2>
                <p className="text-sm text-gray-500">{tickerName}</p>
                {tradeType === 'option' && optionContract && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      optionContract.contract_type === 'call' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {optionContract.contract_type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold">${optionContract.strike_price} Strike</span>
                    <span className="text-xs text-gray-400">
                      Exp: {new Date(optionContract.expiration_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex relative">
                <button 
                    onClick={() => setActiveTab('buy')}
                    className={`flex-1 pb-4 text-center font-medium text-[14px] transition-colors relative ${activeTab === 'buy' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Buy
                    {activeTab === 'buy' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('sell')}
                    className={`flex-1 pb-4 text-center font-medium text-[14px] transition-colors relative ${activeTab === 'sell' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Sell
                    {activeTab === 'sell' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
                    )}
                </button>
              </div>
            </div>

        {/* Form Content */}
        <div className="p-6 bg-white flex-1 overflow-y-auto">
            <div className="space-y-5">
                
                {/* Order Type */}
                <div className="flex items-center justify-between">
                    <label className="font-medium text-black text-[15px]">Order type</label>
                    <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl font-medium text-black text-[14px] hover:bg-gray-200 transition-colors">
                        Market <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Buy In */}
                <div className="flex items-center justify-between">
                    <label className="font-medium text-black text-[15px]">Buy in</label>
                    <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl font-medium text-black text-[14px] hover:bg-gray-200 transition-colors w-40 justify-between">
                        Dollars <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Amount Input */}
                <div className="flex items-center justify-between">
                    <label className="font-medium text-black text-[15px]">Amount</label>
                    <div className="relative w-40">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-medium">$</span>
                        <input 
                            type="text" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-8 pr-14 py-3 bg-gray-100 rounded-xl font-medium text-black text-[14px] focus:outline-none focus:ring-2 focus:ring-black transition-all text-right"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white rounded-md text-[10px] font-medium hover:bg-gray-50 text-black transition-colors">
                            Max
                        </button>
                    </div>
                </div>

                {/* Estimation */}
                <div className="flex justify-end">
                    <span className="text-gray-500 text-[13px]">≈ 0.4213 shares</span>
                </div>

                <div className="h-px bg-gray-100 my-4" />

                {/* Total Cost */}
                <div className="flex items-center justify-between">
                    <span className="font-medium text-black text-[15px]">Estimated cost</span>
                    <span className="font-medium text-black text-[15px]">$ {amount || '0.00'} USD</span>
                </div>

                {!canAfford && activeTab === 'buy' && (
                  <p className="text-red-500 text-sm text-right">Insufficient balance</p>
                )}
              </div>
            </div>

            {/* Footer / Account Selector */}
            <div className="bg-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                <div className="flex flex-col items-start">
                  <span className="font-bold text-gray-900 flex items-center gap-2">
                    Paper Trading <MiniSantaHat className="w-4 h-4 -rotate-12" />
                  </span>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {formatPrice(paperBalance)} USD available <span className="w-1 h-1 rounded-full bg-gray-400" /> Competition Account
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!isValidTrade || isSubmitting}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === 'buy' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : `Review ${activeTab === 'buy' ? 'Buy' : 'Sell'} Order`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradeModal;
