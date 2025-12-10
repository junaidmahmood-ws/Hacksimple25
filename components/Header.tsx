import React, { useState } from 'react';
import { Search, Gift, User, ChevronDown, BarChart2, Ghost } from 'lucide-react';
import { ChristmasLights } from './ChristmasDecorations';

interface HeaderProps {
  isPaperTrading?: boolean;
  onTogglePaperTrading?: (enabled: boolean) => void;
  onShowOnboarding?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isPaperTrading, onTogglePaperTrading, onShowOnboarding }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Basic search functionality - could be expanded later
      console.log('Searching for:', searchQuery);
      // You could implement stock search or other features here
    }
  };

  const navLinks = [
    { name: 'Home', active: true },
    { name: 'Household', badge: 'New' },
    { name: 'Move' },
    { name: 'Activity' },
    { name: 'Tax' },
    { name: 'Mortgage' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur border-b border-red-100 shadow-sm relative">
        <ChristmasLights />
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="text-3xl font-serif font-bold tracking-tighter cursor-pointer text-red-700">W</div>
          
          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href="#" 
                className={`text-sm font-medium flex items-center gap-2 ${link.active ? 'text-red-700 border-b-2 border-red-700 pb-0.5' : 'text-gray-500 hover:text-red-600'}`}
              >
                {link.name}
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-sm">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <span className="hidden lg:block text-xs text-gray-500 font-medium">
            Wed Dec 10 · Markets are open ☀️
          </span>
          
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search name or symbol"
              className="pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono border border-gray-200 px-1.5 rounded">
              /
            </div>
          </div>

          {/* Actions */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Gift className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleProfileMenu}
              className="flex items-center gap-1 p-1 pr-2 text-gray-500 hover:bg-gray-100 rounded-full border border-gray-200/50"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-gray-50 mb-1">
                  <div className="font-bold text-gray-900">John Doe</div>
                  <div className="text-xs text-gray-500">john.doe@example.com</div>
                </div>
                
                <div className="p-2">
                   <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      if (isPaperTrading && onTogglePaperTrading) {
                        onTogglePaperTrading(false);
                      } else if (!isPaperTrading && onShowOnboarding) {
                        onShowOnboarding();
                        setShowProfileMenu(false);
                      }
                   }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPaperTrading ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                           {isPaperTrading ? <Ghost className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Paper Trading</div>
                          <div className="text-[10px] text-gray-500">{isPaperTrading ? 'Active' : 'Off'}</div>
                        </div>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${isPaperTrading ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isPaperTrading ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                   </div>
                </div>

                <div className="mt-1 pt-1 border-t border-gray-50">
                  <button className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg">
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
