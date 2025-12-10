import React, { useState } from 'react';
import { 
  Check, 
  User, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  X, 
  ChevronRight, 
  Trophy,
  Cpu,
  HeartPulse,
  Zap,
  Rocket,
  Globe
} from 'lucide-react';
import { MiniSantaHat } from './ChristmasDecorations';

interface PaperTradingOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (skillLevel: 'student' | 'advanced') => void;
}

const PaperTradingOnboarding: React.FC<PaperTradingOnboardingProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState<'student' | 'advanced' | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSkillSelect = (level: 'student' | 'advanced') => {
    setSkillLevel(level);
    setTimeout(() => setStep(2), 300);
  };

  const themes = [
    { 
      day: 1, 
      title: 'Tech Stocks', 
      icon: <Cpu className="w-5 h-5" />, 
      color: 'bg-blue-50 text-blue-700',
      description: 'Trade leading technology companies',
      stocks: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA']
    },
    { 
      day: 2, 
      title: 'Healthcare', 
      icon: <HeartPulse className="w-5 h-5" />, 
      color: 'bg-red-50 text-red-700',
      description: 'Focus on pharmaceutical and biotech sectors',
      stocks: ['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO']
    },
    { 
      day: 3, 
      title: 'Energy & Green', 
      icon: <Zap className="w-5 h-5" />, 
      color: 'bg-green-50 text-green-700',
      description: 'Renewable energy and traditional energy stocks',
      stocks: ['TSLA', 'ENPH', 'XOM', 'CVX', 'NEE']
    },
    { 
      day: 4, 
      title: 'Crypto & Fintech', 
      icon: <Rocket className="w-5 h-5" />, 
      color: 'bg-purple-50 text-purple-700',
      description: 'Digital assets and financial technology',
      stocks: ['COIN', 'SQ', 'PYPL', 'HOOD', 'SOFI']
    },
    { 
      day: 5, 
      title: 'Global Markets', 
      icon: <Globe className="w-5 h-5" />, 
      color: 'bg-orange-50 text-orange-700',
      description: 'International stocks and emerging markets',
      stocks: ['BABA', 'TSM', 'SAP', 'SHOP', 'SE']
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative z-10">
        
        {/* Header / Progress */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`}
                    />
                ))}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-8">
            {/* STEP 1: SKILL LEVEL */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-[24px] ws-balance text-black">Choose your fighter</h2>
                        <p className="text-gray-500 text-[14px]">Select your experience level to match with similar traders.</p>
                    </div>

                    <div className="grid gap-3">
                        <button 
                            onClick={() => handleSkillSelect('student')}
                            className={`p-4 rounded-2xl border-2 text-left transition-all hover:border-black hover:bg-gray-50 group ${skillLevel === 'student' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-black text-[15px]">Student / Hobbyist</h3>
                                    <p className="text-[13px] text-gray-500">I trade for fun or I'm just learning.</p>
                                </div>
                            </div>
                        </button>

                        <button 
                            onClick={() => handleSkillSelect('advanced')}
                            className={`p-4 rounded-2xl border-2 text-left transition-all hover:border-black hover:bg-gray-50 group ${skillLevel === 'advanced' ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-black text-[15px]">Advanced / Pro</h3>
                                    <p className="text-[13px] text-gray-500">I know my Greeks and technicals.</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: SCHEDULE */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-[24px] ws-balance text-black">5-Day Challenge</h2>
                        <p className="text-gray-500 text-[14px]">Each day features a new sector. Expand to see available stocks.</p>
                    </div>

                    <div className="space-y-2">
                        {themes.map((theme, idx) => (
                            <div 
                                key={theme.day} 
                                className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-all"
                            >
                                <button
                                    onClick={() => setExpandedDay(expandedDay === theme.day ? null : theme.day)}
                                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.color}`}>
                                            {theme.icon}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-medium text-black text-[14px]">Day {theme.day}: {theme.title}</h4>
                                            <p className="text-[12px] text-gray-500 mt-0.5">{theme.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedDay === theme.day ? 'rotate-90' : ''}`} />
                                </button>
                                
                                {expandedDay === theme.day && (
                                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                                        <div className="flex flex-wrap gap-2">
                                            {theme.stocks.map((stock) => (
                                                <span 
                                                    key={stock}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-600 hover:border-black transition-colors cursor-default"
                                                >
                                                    {stock}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setStep(3)}
                        className="w-full py-3.5 bg-black text-white rounded-full font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {step === 3 && (
                <div className="space-y-8 text-center">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                            <DollarSign className="w-10 h-10" />
                        </div>
                        <MiniSantaHat className="w-12 h-12 absolute -top-4 -right-2 -rotate-12" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-[36px] ws-balance text-black">$10,000</h2>
                        <p className="text-gray-500 text-[14px] max-w-xs mx-auto">
                            We've loaded your paper trading account with virtual capital. Start trading to climb the leaderboard!
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-left">
                        <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-amber-800 text-[14px]">Prize Pool</h4>
                            <p className="text-[13px] text-amber-700 mt-0.5">Top 3 traders this week win a $500 gift card.</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                          if (skillLevel) {
                            onComplete(skillLevel);
                          }
                        }}
                        className="w-full py-4 bg-black text-white rounded-full font-medium text-[16px] hover:bg-gray-900 transition-colors"
                    >
                        Start Trading
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaperTradingOnboarding;

