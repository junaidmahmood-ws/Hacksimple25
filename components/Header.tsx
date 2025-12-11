import React, { useState, useEffect, useRef } from 'react';
import { Search, Gift, User, ChevronDown, BarChart2, Ghost, TrendingUp, Loader2, X, LogIn } from 'lucide-react';
import { ChristmasLights } from './ChristmasDecorations';
import { searchTickers, Ticker } from '../services/massiveApi';
import type { User as AuthUser } from '../services/authService';

interface HeaderProps {
  isPaperTrading?: boolean;
  onTogglePaperTrading?: (enabled: boolean) => void;
  onShowOnboarding?: () => void;
  onSelectStock?: (ticker: Ticker) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onShowLogin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isPaperTrading, 
  onTogglePaperTrading, 
  onShowOnboarding, 
  onSelectStock,
  currentUser,
  onLogout,
  onShowLogin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ticker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        const input = searchRef.current?.querySelector('input');
        input?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await searchTickers(searchQuery.toUpperCase(), 5);
        setSearchResults(response.results || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectStock = (ticker: Ticker) => {
    if (onSelectStock) {
      onSelectStock(ticker);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
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
          
          {/* Search with Results Dropdown */}
          <div ref={searchRef} className="relative">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name or symbol"
                className="pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              />
              {isSearching ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              ) : searchQuery ? (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono border border-gray-200 px-1.5 rounded">
                  /
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[60] max-h-[350px] overflow-y-auto">
                {!isPaperTrading && (
                  <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-700">
                    Enable Paper Trading to trade these stocks
                  </div>
                )}
                <ul>
                  {searchResults.map((ticker, index) => (
                    <li key={ticker.ticker}>
                      <button
                        onClick={() => handleSelectStock(ticker)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                          index !== searchResults.length - 1 ? 'border-b border-gray-50' : ''
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{ticker.ticker}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 uppercase">
                              {ticker.primary_exchange}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{ticker.name}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Gift className="w-5 h-5" />
          </button>
          
          {/* User Profile / Login */}
          {currentUser ? (
            <div ref={profileRef} className="relative">
              <button 
                onClick={toggleProfileMenu}
                className="flex items-center gap-1 p-1 pr-2 text-gray-500 hover:bg-gray-100 rounded-full border border-gray-200/50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-gray-50 mb-1">
                    <div className="font-bold text-gray-900">{currentUser.username}</div>
                    <div className="text-xs text-gray-500">Paper Trading Account</div>
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
                    <button 
                      onClick={() => {
                        if (onLogout) {
                          onLogout();
                        }
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onShowLogin}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </button>
          )}
        </div>
      </header>
      <ChristmasLights />
    </>
  );
};

export default Header;
