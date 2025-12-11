import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { Snowflakes } from './components/ChristmasDecorations';
import PaperTradingOnboarding from './components/PaperTradingOnboarding';
import { Holding, TimeRange } from './types';

import RegularDashboard from './components/RegularDashboard';
import PaperTradingDashboard from './components/PaperTradingDashboard';

const holdings: Holding[] = [
  { id: '1', ticker: 'SOFI', shares: 25, value: 675.75, change: 5.00, changePercent: 0.75, iconBg: 'bg-red-600' },
  { id: '2', ticker: 'PLTR', shares: 10, value: 143.10, change: 3.40, changePercent: 2.43, iconBg: 'bg-green-700' },
  { id: '3', ticker: 'VFV', shares: 10, value: 1684.60, change: 1.20, changePercent: 0.07, iconBg: 'bg-red-700' },
  { id: '4', ticker: 'XAW', shares: 8, value: 412.88, change: 0.88, changePercent: 0.21, iconBg: 'bg-green-800' },
  { id: '5', ticker: 'AMZN', shares: 2, value: 53.86, change: 0.80, changePercent: 1.51, iconBg: 'bg-yellow-500' },
  { id: '6', ticker: 'TSLA', shares: 5, value: 196.40, change: -0.10, changePercent: -0.05, iconBg: 'bg-red-500' },
  { id: '7', ticker: 'GOOG', shares: 2, value: 103.34, change: 0.14, changePercent: 0.14, iconBg: 'bg-green-600' },
  { id: '8', ticker: 'ETH', shares: 0.01570448, value: 72.34, change: 0.0163, changePercent: 0.02, iconBg: 'bg-yellow-600' },
  { id: '9', ticker: 'BB', shares: 10, value: 60.90, change: -0.30, changePercent: -0.49, iconBg: 'bg-gray-800' },
  { id: '10', ticker: 'NVDA', shares: 2, value: 83.60, change: -0.48, changePercent: -0.57, iconBg: 'bg-green-700' },
];

const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

function App() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('ALL');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Persisted state
  const [isPaperTrading, setIsPaperTrading] = useState(() => {
    const saved = localStorage.getItem('isPaperTrading');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [hasJoinedPaperTrading, setHasJoinedPaperTrading] = useState(() => {
    const saved = localStorage.getItem('hasJoinedPaperTrading');
    return saved ? JSON.parse(saved) : false;
  });

  const [skillLevel, setSkillLevel] = useState<'student' | 'advanced' | null>(() => {
    const saved = localStorage.getItem('skillLevel');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('isPaperTrading', JSON.stringify(isPaperTrading));
  }, [isPaperTrading]);

  useEffect(() => {
    localStorage.setItem('hasJoinedPaperTrading', JSON.stringify(hasJoinedPaperTrading));
  }, [hasJoinedPaperTrading]);

  useEffect(() => {
    if (skillLevel) {
      localStorage.setItem('skillLevel', JSON.stringify(skillLevel));
    }
  }, [skillLevel]);

  const handleStartPaperTrading = (userSkillLevel: 'student' | 'advanced') => {
    setIsPaperTrading(true);
    setHasJoinedPaperTrading(true);
    setSkillLevel(userSkillLevel);
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 relative overflow-hidden">
      <Snowflakes />
      <PaperTradingOnboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
        onComplete={handleStartPaperTrading}
      />
      <Header 
        isPaperTrading={isPaperTrading}
        onTogglePaperTrading={setIsPaperTrading}
        onShowOnboarding={() => {
          // Only show onboarding if user hasn't joined yet
          if (!hasJoinedPaperTrading) {
            setShowOnboarding(true);
          } else {
            // If they've already joined, just switch to paper trading mode
            setIsPaperTrading(true);
          }
        }}
      />

      <main className="max-w-[1400px] mx-auto pt-10 px-6 lg:px-12">
        {isPaperTrading ? (
          <PaperTradingDashboard 
            balanceVisible={balanceVisible}
            setBalanceVisible={setBalanceVisible}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            setIsPaperTrading={setIsPaperTrading}
            timeRanges={timeRanges}
          />
        ) : (
          <RegularDashboard 
            balanceVisible={balanceVisible}
            setBalanceVisible={setBalanceVisible}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            hasJoinedPaperTrading={hasJoinedPaperTrading}
            setShowOnboarding={() => setShowOnboarding(true)}
            holdings={holdings}
            timeRanges={timeRanges}
          />
        )}
      </main>
    </div>
  );
}

export default App;
