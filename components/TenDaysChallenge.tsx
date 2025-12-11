import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';

interface DayCard {
  day: number;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  task: string;
  reward: string;
}

interface TenDaysChallengeProps {
  onSelectDay: (day: number) => void;
  completedDays: number[];
  currentDay: number;
}

const dayCards: DayCard[] = [
  {
    day: 1,
    title: "OPEN SLEIGH",
    subtitle: "ACCOUNT",
    bgColor: "bg-[#1a4d3e]", // Dark green
    textColor: "text-white",
    task: "Create your paper trading account and get $10,000 virtual cash",
    reward: "Account activated with $10,000"
  },
  {
    day: 2,
    title: "STOCKING STUFFER",
    subtitle: "PICKS",
    bgColor: "bg-[#f5f0e8]", // Cream/beige
    textColor: "text-[#2d2d2d]",
    task: "Add 3 stocks to your watchlist",
    reward: "Watchlist bonus: +$100"
  },
  {
    day: 3,
    title: "BUILD YOUR",
    subtitle: "GINGERBREAD PORTFOLIO",
    bgColor: "bg-[#f8f6f3]", // Light cream
    textColor: "text-[#2d2d2d]",
    task: "Make your first stock purchase",
    reward: "First trade bonus: +$50"
  },
  {
    day: 4,
    title: "BAKE YOUR",
    subtitle: "GINGERBREAD ASSETS",
    bgColor: "bg-[#e8f5e9]", // Light mint green
    textColor: "text-[#2d2d2d]",
    task: "Diversify with at least 3 different stocks",
    reward: "Diversification bonus: +$75"
  },
  {
    day: 5,
    title: "THE GIFT OF",
    subtitle: "GROWTH",
    bgColor: "bg-[#4a7c59]", // Sage green
    textColor: "text-white",
    task: "Achieve 2% portfolio growth",
    reward: "Growth milestone: +$100"
  },
  {
    day: 6,
    title: "FUNDING YOUR",
    subtitle: "FESTIVE FUTURE",
    bgColor: "bg-[#f8d7da]", // Soft pink
    textColor: "text-[#2d2d2d]",
    task: "Invest in a crypto asset (ETH or BTC)",
    reward: "Crypto explorer: +$50"
  },
  {
    day: 7,
    title: "DON'T GET BOXED,",
    subtitle: "COIN IN",
    bgColor: "bg-[#f5e6e8]", // Light pink
    textColor: "text-[#2d2d2d]",
    task: "Execute a profitable sell trade",
    reward: "Profit taker: +$100"
  },
  {
    day: 8,
    title: "CASH IS KING,",
    subtitle: "SAVE YOUR",
    bgColor: "bg-[#9ca3af]", // Gray
    textColor: "text-[#1f2937]",
    task: "Keep at least $2,000 in cash reserves",
    reward: "Cash reserve bonus: +$50"
  },
  {
    day: 9,
    title: "WISH LIST",
    subtitle: "TRADE-OFFS",
    bgColor: "bg-[#fafafa]", // Off-white
    textColor: "text-[#2d2d2d]",
    task: "Complete 5 total trades",
    reward: "Active trader: +$75"
  },
  {
    day: 10,
    title: "MERRY MARKET",
    subtitle: "WRAP-UP",
    bgColor: "bg-[#d4edda]", // Light green
    textColor: "text-[#2d2d2d]",
    task: "End with a portfolio value above $10,500",
    reward: "Challenge Champion: +$200"
  }
];

// Card illustrations as simple SVG components
const CardIllustration: React.FC<{ day: number }> = ({ day }) => {
  switch (day) {
    case 1:
      // Gold W coin
      return (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-serif text-yellow-900" style={{ fontFamily: 'Bodoni Moda, serif' }}>W</span>
        </div>
      );
    case 2:
      // Gift tag
      return (
        <div className="relative">
          <div className="w-10 h-14 bg-[#c9a962] rounded-sm transform rotate-12 shadow-md" />
          <div className="absolute top-0 left-3 w-3 h-3 rounded-full border-2 border-[#8b7355]" />
          <div className="absolute -top-2 left-2 w-8 h-4 border-t-2 border-[#2d5a4a]" style={{ borderRadius: '50% 50% 0 0' }} />
        </div>
      );
    case 3:
      // Gingerbread house / candy cane R
      return (
        <div className="text-4xl">🏠</div>
      );
    case 4:
      // Gift boxes
      return (
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-[#87ceeb] rounded-sm shadow-sm" />
          <div className="w-6 h-10 bg-[#f0e68c] rounded-sm shadow-sm -mt-2" />
        </div>
      );
    case 5:
      // Growth arrow with percentage
      return (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14l5-5 5 5H7z" />
              <rect x="11" y="10" width="2" height="8" />
            </svg>
          </div>
          <span className="text-xs text-white/90 mt-1 font-medium">$4.2%</span>
          <span className="text-[10px] text-white/70">GROWTH</span>
        </div>
      );
    case 6:
      // Ethereum logo
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#627eea]" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 0l-1 3.4v18.8l1 .9 7-4.1L16 0z" opacity="0.6"/>
            <path d="M16 0L9 19l7 4.1V0z"/>
            <path d="M16 24.5l-.5.7v6l.5 1.4 7-9.9-7 1.8z" opacity="0.6"/>
            <path d="M16 32.6v-8.1L9 22.7l7 9.9z"/>
            <path d="M16 23.1l7-4.1-7-3.2v7.3z" opacity="0.2"/>
            <path d="M9 19l7 4.1v-7.3L9 19z" opacity="0.6"/>
          </svg>
        </div>
      );
    case 7:
      // Gift box with coins
      return (
        <div className="relative">
          <div className="w-12 h-10 bg-[#ffb6c1] rounded-sm shadow-md" />
          <div className="absolute -top-2 left-1 w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
          <div className="absolute -top-1 left-5 w-2 h-2 rounded-full bg-yellow-300 shadow-sm" />
          <div className="absolute -top-3 left-8 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm" />
        </div>
      );
    case 8:
      // Vault/Safe
      return (
        <div className="w-14 h-12 bg-gradient-to-b from-gray-500 to-gray-600 rounded-md shadow-lg flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
            <div className="w-1 h-3 bg-gray-400" />
          </div>
        </div>
      );
    case 9:
      // Infinity symbol with charts
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl text-pink-400">∞</div>
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-pink-300 rounded-full" />
            <div className="w-1 h-5 bg-pink-400 rounded-full" />
            <div className="w-1 h-2 bg-pink-300 rounded-full" />
            <div className="w-1 h-4 bg-pink-400 rounded-full" />
          </div>
        </div>
      );
    case 10:
      // Plant growth
      return (
        <div className="relative">
          <svg className="w-14 h-14 text-[#4ade80]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c-4-2-8-6-8-12 4 0 8 2 8 6V6c0 4 4 6 8 6-0 6-4 10-8 12v-2z" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const TenDaysChallenge: React.FC<TenDaysChallengeProps> = ({ 
  onSelectDay, 
  completedDays,
  currentDay
}) => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCardClick = (day: number) => {
    if (day <= currentDay) {
      setSelectedCard(selectedCard === day ? null : day);
      onSelectDay(day);
    }
  };

  const isLocked = (day: number) => day > currentDay;
  const isCompleted = (day: number) => completedDays.includes(day);

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Limited Time</p>
          <h2 className="text-xl text-gray-900" style={{ fontFamily: 'Source Serif 4, serif' }}>
            10 Days of Paper Trading
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
          <span className="text-sm text-gray-600">
            {completedDays.length}/10
          </span>
        </div>
      </div>

      {/* Cards Carousel */}
      <div className="relative -mx-6 px-6">
        <div 
          className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dayCards.map((card) => {
            const locked = isLocked(card.day);
            const completed = isCompleted(card.day);
            
            return (
              <div
                key={card.day}
                onClick={() => handleCardClick(card.day)}
                className={`
                  relative flex-shrink-0 w-[140px] h-[200px] rounded-2xl overflow-hidden 
                  snap-center transition-all duration-300 shadow-sm
                  ${locked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'}
                  ${selectedCard === card.day ? 'ring-2 ring-gray-900 ring-offset-2' : ''}
                  ${card.bgColor}
                `}
              >
                {/* Day Label */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] uppercase tracking-wider ${card.textColor} opacity-70`}>
                    Day {card.day}
                  </span>
                </div>

                {/* Status Badge */}
                {completed && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {locked && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-gray-400/50 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Illustration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90">
                  <CardIllustration day={card.day} />
                </div>

                {/* Title */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 
                    className={`text-sm leading-tight ${card.textColor}`}
                    style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 500 }}
                  >
                    {card.title}
                  </h3>
                  <p 
                    className={`text-xs mt-0.5 ${card.textColor} opacity-80`}
                    style={{ fontFamily: 'Source Serif 4, serif' }}
                  >
                    {card.subtitle}
                  </p>
                </div>

                {/* Subtle decoration */}
                {card.day === 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedCard && (
        <div className="mt-6 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Day {selectedCard}
                </span>
                {isCompleted(selectedCard) && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Complete
                  </span>
                )}
              </div>
              <h3 
                className="text-lg text-gray-900"
                style={{ fontFamily: 'Source Serif 4, serif' }}
              >
                {dayCards[selectedCard - 1].title} {dayCards[selectedCard - 1].subtitle}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {dayCards[selectedCard - 1].task}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {dayCards[selectedCard - 1].reward}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${dayCards[selectedCard - 1].bgColor}`}>
              <CardIllustration day={selectedCard} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenDaysChallenge;
