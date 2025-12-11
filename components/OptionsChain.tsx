import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface OptionsChainProps {
  ticker: string;
  currentPrice: number;
  selectedOption: MockOption | null;
  onSelectOption: (option: MockOption) => void;
  isLoading?: boolean;
}

export interface MockOption {
  id: string;
  strike_price: number;
  contract_type: 'call' | 'put';
  expiration_date: string;
  bid: number;
  ask: number;
  mid: number;
  volume: number;
  openInterest: number;
  percentChange: number;
  breakeven: number;
  toBreakeven: number;
}

// Generate expiration dates starting from today
const generateExpirationDates = () => {
  const dates: { value: string; label: string; daysOut: number }[] = [];
  const today = new Date();
  
  // Weekly expirations for next 4 weeks
  for (let i = 0; i < 4; i++) {
    const friday = new Date(today);
    friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7) + (i * 7));
    if (friday <= today) friday.setDate(friday.getDate() + 7);
    
    const daysOut = Math.ceil((friday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    dates.push({
      value: friday.toISOString().split('T')[0],
      label: `${friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${daysOut}d)`,
      daysOut
    });
  }
  
  // Monthly expirations for next 3 months (third Friday)
  for (let m = 1; m <= 3; m++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
    // Find third Friday
    let fridayCount = 0;
    for (let d = 1; d <= 31; d++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
      if (date.getMonth() !== monthDate.getMonth()) break;
      if (date.getDay() === 5) {
        fridayCount++;
        if (fridayCount === 3) {
          const daysOut = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          dates.push({
            value: date.toISOString().split('T')[0],
            label: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${daysOut}d)`,
            daysOut
          });
          break;
        }
      }
    }
  }
  
  return dates;
};

const EXPIRATION_DATES = generateExpirationDates();

export const OptionsChain: React.FC<OptionsChainProps> = ({
  ticker,
  currentPrice,
  selectedOption,
  onSelectOption,
  isLoading
}) => {
  const [contractType, setContractType] = useState<'call' | 'put'>('call');
  const [selectedExpiration, setSelectedExpiration] = useState(EXPIRATION_DATES[0]?.value || '');
  const [showExpirationDropdown, setShowExpirationDropdown] = useState(false);
  
  const currentExpiration = EXPIRATION_DATES.find(d => d.value === selectedExpiration) || EXPIRATION_DATES[0];

  // Generate mock options based on current price and selected expiration
  const { otmOptions, itmOptions } = useMemo(() => {
    if (!currentPrice || currentPrice <= 0) {
      return { otmOptions: [], itmOptions: [] };
    }

    // Round to nearest $2.50 increment
    const roundToStrike = (price: number) => Math.round(price / 2.5) * 2.5;
    const baseStrike = roundToStrike(currentPrice);
    
    // Get days to expiration for time value calculation
    const expDate = EXPIRATION_DATES.find(d => d.value === selectedExpiration);
    const daysToExpiry = expDate?.daysOut || 7;
    const timeMultiplier = Math.sqrt(daysToExpiry / 30); // More time = more value

    const generateOption = (strike: number, isOTM: boolean, index: number): MockOption => {
      const distance = Math.abs(strike - currentPrice);
      
      // Premium decreases as you go further OTM, increases as you go deeper ITM
      const intrinsicValue = contractType === 'call' 
        ? Math.max(0, currentPrice - strike) 
        : Math.max(0, strike - currentPrice);
      
      // Time value scales with days to expiry
      const baseTimeValue = Math.max(0.05, 3 - (distance * 0.1));
      const timeValue = baseTimeValue * timeMultiplier + (Math.random() * 0.5);
      const mid = intrinsicValue + timeValue;
      const spread = 0.02 + Math.random() * 0.03;
      
      // Use a seed based on strike for consistent random values
      const seed = strike * 100 + index;
      const pseudoRandom = (n: number) => ((seed * n) % 1000) / 1000;
      
      return {
        id: `${ticker}-${contractType}-${strike}-${selectedExpiration}-${index}`,
        strike_price: strike,
        contract_type: contractType,
        expiration_date: selectedExpiration,
        bid: Math.max(0.01, mid - spread),
        ask: mid + spread,
        mid: mid,
        volume: Math.floor(1000 + pseudoRandom(17) * 50000),
        openInterest: Math.floor(5000 + pseudoRandom(31) * 45000),
        percentChange: isOTM 
          ? -(10 + pseudoRandom(7) * 30) // OTM options losing value
          : (10 + pseudoRandom(13) * 40),  // ITM options gaining value
        breakeven: contractType === 'call' ? strike + mid : strike - mid,
        toBreakeven: ((mid / strike) * 100)
      };
    };

    const otm: MockOption[] = [];
    const itm: MockOption[] = [];

    // Generate 6 OTM options (ABOVE current price for calls)
    for (let i = 1; i <= 6; i++) {
      const strike = contractType === 'call' 
        ? baseStrike + (i * 2.5) // Higher strikes for call OTM
        : baseStrike - (i * 2.5); // Lower strikes for put OTM
      otm.push(generateOption(strike, true, i));
    }

    // Generate 6 ITM options (BELOW current price for calls)
    for (let i = 1; i <= 6; i++) {
      const strike = contractType === 'call'
        ? baseStrike - (i * 2.5) // Lower strikes for call ITM
        : baseStrike + (i * 2.5); // Higher strikes for put ITM
      itm.push(generateOption(strike, false, i));
    }

    // Sort: ITM closest to price first, OTM closest to price first
    if (contractType === 'call') {
      itm.sort((a, b) => b.strike_price - a.strike_price); // High to low (closest first)
      otm.sort((a, b) => a.strike_price - b.strike_price); // Low to high (closest first)
    } else {
      itm.sort((a, b) => a.strike_price - b.strike_price);
      otm.sort((a, b) => b.strike_price - a.strike_price);
    }

    return { otmOptions: otm, itmOptions: itm };
  }, [currentPrice, contractType, ticker, selectedExpiration]);

  const OptionRow = ({ option }: { option: MockOption }) => {
    const isSelected = selectedOption?.id === option.id;
    const isPositiveChange = option.percentChange >= 0;

    return (
      <div 
        onClick={() => onSelectOption(option)}
        className="grid grid-cols-7 gap-2 px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50"
      >
        {/* Strike */}
        <div className="col-span-1 font-bold text-gray-900">
          ${option.strike_price.toFixed(2)}
        </div>
        
        {/* Breakeven */}
        <div className="col-span-1 text-gray-500">
          ${option.breakeven.toFixed(2)}
        </div>
        
        {/* To breakeven */}
        <div className="col-span-1 text-gray-500">
          {option.toBreakeven.toFixed(2)}%
        </div>
        
        {/* Open interest */}
        <div className="col-span-1 text-right text-gray-900">
          {option.openInterest.toLocaleString()}
        </div>
        
        {/* Volume */}
        <div className="col-span-1 text-right text-gray-900">
          {option.volume.toLocaleString()}
        </div>
        
        {/* Mid with change */}
        <div className={`col-span-1 text-right ${isPositiveChange ? 'text-green-600' : 'text-red-500'}`}>
          ${option.mid.toFixed(2)} <span className="text-xs">({isPositiveChange ? '+' : ''}{option.percentChange.toFixed(2)}%)</span>
        </div>
        
        {/* Buy Button - Ask price */}
        <div className="col-span-1 text-right">
          <button 
            className={`px-4 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
              isSelected 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
            }`}
          >
            ${option.ask.toFixed(2)}
          </button>
        </div>
      </div>
    );
  };

  const priceChangePercent = '+0.71'; // Mock change

  return (
    <div className="w-full bg-white h-full flex flex-col">
      {/* Controls Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Call/Put Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${
                contractType === 'call' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setContractType('call')}
            >
              Call
            </button>
            <button 
              className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${
                contractType === 'put' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setContractType('put')}
            >
              Put
            </button>
          </div>

          {/* Expiration Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowExpirationDropdown(!showExpirationDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
            >
              {currentExpiration?.label || 'Select Date'}
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showExpirationDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showExpirationDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 min-w-[180px]">
                {EXPIRATION_DATES.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => {
                      setSelectedExpiration(date.value);
                      setShowExpirationDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                      selectedExpiration === date.value 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-7 gap-2 px-4 py-3 text-xs font-medium text-gray-400 border-b border-gray-100 flex-shrink-0">
        <div className="col-span-1">Strike</div>
        <div className="col-span-1">Breakeven</div>
        <div className="col-span-1">To breakeven</div>
        <div className="col-span-1 text-right">Open interest</div>
        <div className="col-span-1 text-right">Volume</div>
        <div className="col-span-1 text-right">Mid</div>
        <div className="col-span-1 text-right">Buy</div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto min-h-[500px]">
        {isLoading || !currentPrice ? (
          <div className="py-20 text-center text-gray-400">Loading options data...</div>
        ) : (
          <>
            {/* OTM Section - ABOVE the divider */}
            {otmOptions.map((option) => (
              <OptionRow key={option.id} option={option} />
            ))}

            {/* Price Divider - THE MIDDLE */}
            <div className="sticky top-0 z-10 bg-white py-2 px-4 flex items-center justify-center border-y border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ChevronDown className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">ITM</span>
                <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="text-gray-900 font-bold">{ticker}</span>
                  <span className="text-gray-900 font-bold">${currentPrice.toFixed(2)}</span>
                  <span className="text-green-600 font-semibold">({priceChangePercent}%)</span>
                </div>
                <span className="text-gray-400">OTM</span>
                <ChevronUp className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            {/* ITM Section - BELOW the divider */}
            {itmOptions.map((option) => (
              <OptionRow key={option.id} option={option} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
