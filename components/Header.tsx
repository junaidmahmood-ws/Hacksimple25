import React, { useState } from 'react';
import { Search, Gift, User, ChevronDown } from 'lucide-react';
import { askFinancialAdvisor } from '../services/geminiService';
import { ChristmasLights } from './ChristmasDecorations';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      const answer = await askFinancialAdvisor(searchQuery);
      setSearchResult(answer);
      setIsSearching(false);
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
          
          <button className="flex items-center gap-1 p-1 pr-2 text-gray-500 hover:bg-gray-100 rounded-full border border-gray-200/50">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* AI Search Result Modal */}
      {searchResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-1 rounded">AI</span> Insight
              </h3>
              <button onClick={() => setSearchResult(null)} className="text-gray-400 hover:text-gray-600">
                <ChevronDown className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {searchResult}
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setSearchResult(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isSearching && (
        <div className="fixed top-20 right-1/2 translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 animate-pulse">
          Thinking...
        </div>
      )}
    </>
  );
};

export default Header;
