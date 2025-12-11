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
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 relative">
        <ChristmasLights />
        <div className="flex items-center gap-8">
          {/* Logo - Wealthsimple W */}
          <img 
            src="/ws-logo.png" 
            alt="W" 
            className="w-8 h-8 cursor-pointer object-contain"
          />
          
          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href="#" 
                className={`text-[14px] font-medium flex items-center gap-2 transition-colors ${link.active ? 'text-black' : 'text-gray-500 hover:text-black'}`}
              >
                {link.name}
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 rounded">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search name or symbol"
              className="pl-10 pr-12 py-2.5 bg-gray-100 border-0 rounded-full text-[14px] w-64 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded">
              /
            </div>
          </div>

          {/* Actions */}
          <button className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <Gift className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleProfileMenu}
              className="flex items-center gap-1.5 p-1.5 pr-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 p-2 z-[60]">
                <div className="p-3 border-b border-gray-100 mb-1">
                  <div className="font-medium text-black text-[15px]">John Doe</div>
                  <div className="text-[13px] text-gray-500">john.doe@example.com</div>
                </div>
                
                <div className="p-2">
                   <div className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" onClick={(e) => {
                      e.stopPropagation();
                      if (isPaperTrading && onTogglePaperTrading) {
                        onTogglePaperTrading(false);
                      } else if (!isPaperTrading && onShowOnboarding) {
                        onShowOnboarding();
                        setShowProfileMenu(false);
                      }
                   }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isPaperTrading ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                           {isPaperTrading ? <Ghost className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-black">Paper Trading</div>
                          <div className="text-[12px] text-gray-500">{isPaperTrading ? 'Active' : 'Off'}</div>
                        </div>
                      </div>
                      <div className={`w-11 h-6 rounded-full relative transition-colors ${isPaperTrading ? 'bg-amber-400' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPaperTrading ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                   </div>
                </div>

                <div className="mt-1 pt-1 border-t border-gray-100">
                  <button className="w-full text-left px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
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
