import React, { useState } from 'react';
import { ChevronDown, ArrowUpDown, X } from 'lucide-react';
import { MiniSantaHat } from './ChristmasDecorations';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('100');

  if (!isOpen) return null;

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
            </div>
        </div>

        {/* Footer / Account Selector */}
        <div className="bg-gray-100 p-6 space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-black/5 rounded-xl transition-colors group">
                <div className="flex flex-col items-start">
                    <span className="font-medium text-black text-[14px] flex items-center gap-2">
                        Paper Trading <MiniSantaHat className="w-4 h-4 -rotate-12" />
                    </span>
                    <div className="text-[12px] text-gray-500 flex items-center gap-1">
                        $10,000.00 USD available <span className="w-1 h-1 rounded-full bg-gray-400" /> Competition Account
                    </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>

            <button className="w-full py-4 bg-black text-white rounded-full font-medium text-[16px] hover:bg-gray-900 transition-colors active:scale-[0.99]">
                Review Order
            </button>
        </div>

      </div>
    </div>
  );
};

export default TradeModal;

