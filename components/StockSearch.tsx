import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Loader2 } from 'lucide-react';
import { searchTickers, Ticker } from '../services/massiveApi';

interface StockSearchProps {
  onSelectStock: (ticker: Ticker) => void;
  placeholder?: string;
}

const StockSearch: React.FC<StockSearchProps> = ({ 
  onSelectStock, 
  placeholder = "Search stocks..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ticker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Longer debounce to help with rate limiting (5 calls/min = 12s between calls)
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await searchTickers(query.toUpperCase(), 5);
        setResults(response.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
        const errorMsg = err instanceof Error && err.message.includes('429') 
          ? 'Rate limited. Please wait a moment...' 
          : 'Failed to search. Check your API key.';
        setError(errorMsg);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 800); // Longer debounce to reduce API calls

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (ticker: Ticker) => {
    onSelectStock(ticker);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        ) : query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {error ? (
            <div className="p-4 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Free tier: 5 API calls/minute</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <ul>
              {results.map((ticker, index) => (
                <li key={ticker.ticker}>
                  <button
                    onClick={() => handleSelect(ticker)}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                      index !== results.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    {/* Ticker Icon */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Ticker Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{ticker.ticker}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 uppercase">
                          {ticker.primary_exchange}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {ticker.name}
                      </p>
                    </div>

                    {/* Market Type */}
                    <div className="flex-shrink-0">
                      <span className="text-xs font-medium text-gray-400 uppercase">
                        {ticker.type}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;

