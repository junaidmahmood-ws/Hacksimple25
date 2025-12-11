import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Tag, 
  PieChart, 
  Gift, 
  TrendingUp, 
  CircleDollarSign,
  Box,
  Vault,
  ListChecks,
  Sparkles,
  Check,
  Lock
} from 'lucide-react';

interface DayCard {
  day: number;
  title: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  icon: React.ReactNode;
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
    bgColor: "bg-gradient-to-br from-emerald-600 to-emerald-800",
    accentColor: "text-yellow-400",
    icon: <Coins className="w-10 h-10 text-yellow-400" />,
    task: "Create your paper trading account and get $10,000 virtual cash",
    reward: "Account activated with $10,000"
  },
  {
    day: 2,
    title: "STOCKING STUFFER",
    subtitle: "PICKS",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    accentColor: "text-amber-700",
    icon: <Tag className="w-10 h-10 text-amber-600" />,
    task: "Add 3 stocks to your watchlist",
    reward: "Watchlist bonus: +$100"
  },
  {
    day: 3,
    title: "BUILD YOUR",
    subtitle: "GINGERBREAD PORTFOLIO",
    bgColor: "bg-gradient-to-br from-stone-50 to-stone-100",
    accentColor: "text-red-600",
    icon: <PieChart className="w-10 h-10 text-red-500" />,
    task: "Make your first stock purchase",
    reward: "First trade bonus: +$50"
  },
  {
    day: 4,
    title: "BAKE YOUR",
    subtitle: "GINGERBREAD ASSETS",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-100",
    accentColor: "text-emerald-700",
    icon: <Gift className="w-10 h-10 text-emerald-600" />,
    task: "Diversify with at least 3 different stocks",
    reward: "Diversification bonus: +$75"
  },
  {
    day: 5,
    title: "THE GIFT OF",
    subtitle: "GROWTH",
    bgColor: "bg-gradient-to-br from-emerald-500 to-green-700",
    accentColor: "text-white",
    icon: <TrendingUp className="w-10 h-10 text-white" />,
    task: "Achieve 2% portfolio growth",
    reward: "Growth milestone: +$100"
  },
  {
    day: 6,
    title: "FUNDING YOUR",
    subtitle: "FESTIVE FUTURE",
    bgColor: "bg-gradient-to-br from-rose-100 to-pink-200",
    accentColor: "text-emerald-600",
    icon: <CircleDollarSign className="w-10 h-10 text-emerald-500" />,
    task: "Invest in a crypto asset (ETH or BTC)",
    reward: "Crypto explorer: +$50"
  },
  {
    day: 7,
    title: "DON'T GET BOXED,",
    subtitle: "COIN IN",
    bgColor: "bg-gradient-to-br from-pink-100 to-rose-200",
    accentColor: "text-yellow-600",
    icon: <Box className="w-10 h-10 text-yellow-500" />,
    task: "Execute a profitable sell trade",
    reward: "Profit taker: +$100"
  },
  {
    day: 8,
    title: "CASH IS KING,",
    subtitle: "SAVE YOUR",
    bgColor: "bg-gradient-to-br from-gray-300 to-gray-500",
    accentColor: "text-gray-800",
    icon: <Vault className="w-10 h-10 text-gray-700" />,
    task: "Keep at least $2,000 in cash reserves",
    reward: "Cash reserve bonus: +$50"
  },
  {
    day: 9,
    title: "WISH LIST",
    subtitle: "TRADE-OFFS",
    bgColor: "bg-gradient-to-br from-white to-gray-50",
    accentColor: "text-pink-500",
    icon: <ListChecks className="w-10 h-10 text-pink-400" />,
    task: "Complete 5 total trades",
    reward: "Active trader: +$75"
  },
  {
    day: 10,
    title: "MERRY MARKET",
    subtitle: "WRAP-UP",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
    accentColor: "text-emerald-600",
    icon: <Sparkles className="w-10 h-10 text-emerald-500" />,
    task: "End with a portfolio value above $10,500",
    reward: "Challenge Champion: +$200"
  }
];

const TenDaysChallenge: React.FC<TenDaysChallengeProps> = ({ 
  onSelectDay, 
  completedDays,
  currentDay
}) => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCardClick = (day: number) => {
    if (day <= currentDay) {
      setSelectedCard(day);
      onSelectDay(day);
    }
  };

  const isLocked = (day: number) => day > currentDay;
  const isCompleted = (day: number) => completedDays.includes(day);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🎄 10 Days of Paper Trading
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Complete daily challenges to earn bonus virtual cash!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
          <span className="text-emerald-700 font-bold text-sm">
            {completedDays.length}/10 Complete
          </span>
        </div>
      </div>

      {/* Cards Carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" 
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {dayCards.map((card) => {
            const locked = isLocked(card.day);
            const completed = isCompleted(card.day);
            
            return (
              <div
                key={card.day}
                onClick={() => handleCardClick(card.day)}
                className={`
                  relative flex-shrink-0 w-[160px] h-[220px] rounded-2xl overflow-hidden 
                  snap-center cursor-pointer transition-all duration-300
                  ${locked ? 'opacity-60 grayscale' : 'hover:scale-105 hover:shadow-xl'}
                  ${selectedCard === card.day ? 'ring-4 ring-emerald-400 ring-offset-2' : ''}
                  ${card.bgColor}
                `}
              >
                {/* Day Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`
                    text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full
                    ${card.day <= 5 ? 'bg-white/30 text-white' : 'bg-black/10 text-gray-700'}
                  `}>
                    Day {card.day}
                  </span>
                </div>

                {/* Completion/Lock Badge */}
                {completed && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                {locked && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="mb-3">
                    {card.icon}
                  </div>
                  <h3 className={`text-sm font-bold leading-tight ${
                    card.day === 5 || card.day === 1 ? 'text-white' : 'text-gray-800'
                  }`}>
                    {card.title}
                  </h3>
                  <p className={`text-xs font-semibold mt-0.5 ${
                    card.day === 5 || card.day === 1 ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {card.subtitle}
                  </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/3 right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedCard && (
        <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  Day {selectedCard}
                </span>
                {isCompleted(selectedCard) && (
                  <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {dayCards[selectedCard - 1].title} {dayCards[selectedCard - 1].subtitle}
              </h3>
              <p className="text-gray-600 mt-2">
                <strong>Task:</strong> {dayCards[selectedCard - 1].task}
              </p>
              <p className="text-emerald-600 font-semibold mt-1">
                <strong>Reward:</strong> {dayCards[selectedCard - 1].reward}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${dayCards[selectedCard - 1].bgColor}`}>
              {dayCards[selectedCard - 1].icon}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenDaysChallenge;

