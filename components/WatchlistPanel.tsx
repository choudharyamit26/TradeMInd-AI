import React, { useState } from 'react';
import { Star, Trash2, Plus, TrendingUp, Layers, List, Check } from 'lucide-react';

interface WatchlistPanelProps {
  watchlist: string[];
  onRemove: (symbol: string) => void;
  onAdd: (symbol: string) => void;
  onSelect: (symbol: string) => void;
  tradingMode: string;
}

// Predefined Market Data
const INDICES = [
  "NIFTY 50", "BANKNIFTY", "FINNIFTY", "SENSEX", "INDIA VIX",
  "NIFTY MIDCAP 100", "NIFTY SMALLCAP 100", "NIFTY NEXT 50",
  "NIFTY IT", "NIFTY AUTO", "NIFTY METAL", "NIFTY PHARMA", 
  "NIFTY FMCG", "NIFTY ENERGY", "NIFTY PSU BANK", "NIFTY PVT BANK",
  "NIFTY REALTY", "NIFTY MEDIA", "NIFTY INFRA", "NIFTY COMMODITIES"
];

const NIFTY_50 = [
  "ADANIENT", "ADANIPORTS", "APOLLOHOSP", "ASIANPAINT", "AXISBANK",
  "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BEL", "BHARTIARTL",
  "BPCL", "BRITANNIA", "CIPLA", "COALINDIA", "DIVISLAB",
  "DRREDDY", "EICHERMOT", "GRASIM", "HCLTECH", "HDFCBANK",
  "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDUNILVR", "ICICIBANK",
  "INDUSINDBK", "INFY", "ITC", "JSWSTEEL", "KOTAKBANK",
  "LT", "LTIM", "M&M", "MARUTI", "NESTLEIND",
  "NTPC", "ONGC", "POWERGRID", "RELIANCE", "SBILIFE",
  "SBIN", "SHRIRAMFIN", "SUNPHARMA", "TATACONSUM", "TATAMOTORS",
  "TATASTEEL", "TCS", "TECHM", "TITAN", "TRENT",
  "ULTRACEMCO", "WIPRO"
];

type Tab = 'saved' | 'indices' | 'stocks';

export const WatchlistPanel: React.FC<WatchlistPanelProps> = ({
  watchlist,
  onRemove,
  onAdd,
  onSelect,
  tradingMode
}) => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [filter, setFilter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.toUpperCase());
      setInput('');
    }
  };

  const getDisplayList = () => {
    let list: string[] = [];
    if (activeTab === 'saved') list = watchlist;
    else if (activeTab === 'indices') list = INDICES;
    else if (activeTab === 'stocks') list = NIFTY_50;

    if (filter) {
      return list.filter(item => item.toLowerCase().includes(filter.toLowerCase()));
    }
    return list;
  };

  const displayList = getDisplayList();

  return (
    <div className="w-full md:w-80 flex-none bg-slate-900/50 border-l border-slate-800 flex flex-col h-full backdrop-blur-sm transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2 text-emerald-400">
            <Layers className="w-5 h-5" />
            <h2 className="font-bold text-sm tracking-wider">MARKET WATCH</h2>
          </div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">{tradingMode} MODE</div>
        </div>
        
        {/* Search / Add Input */}
        <form onSubmit={handleSubmit} className="relative mb-3">
          <input
            type="text"
            value={activeTab === 'saved' ? input : filter}
            onChange={(e) => activeTab === 'saved' ? setInput(e.target.value) : setFilter(e.target.value)}
            placeholder={activeTab === 'saved' ? "Add symbol (e.g. ZOMATO)" : "Filter list..."}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-colors"
          />
          <button 
            type={activeTab === 'saved' ? 'submit' : 'button'}
            disabled={activeTab === 'saved' && !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 disabled:opacity-50"
          >
            {activeTab === 'saved' ? <Plus size={14} /> : null}
          </button>
        </form>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium rounded-md transition-all ${
              activeTab === 'saved' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Star size={12} /> Saved
          </button>
          <button
            onClick={() => setActiveTab('indices')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium rounded-md transition-all ${
              activeTab === 'indices' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Layers size={12} /> Indices
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium rounded-md transition-all ${
              activeTab === 'stocks' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <List size={12} /> Nifty 50
          </button>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin bg-gradient-to-b from-transparent to-slate-950/50">
        {displayList.length === 0 ? (
          <div className="text-center p-8 text-slate-600 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
              {activeTab === 'saved' ? <Star size={16} /> : <List size={16} />}
            </div>
            <p className="text-xs mb-1">No items found</p>
            <p className="text-[10px] opacity-60">
              {activeTab === 'saved' ? "Add symbols to track them" : "Try a different search"}
            </p>
          </div>
        ) : (
          displayList.map((symbol) => {
            const isSaved = watchlist.includes(symbol);
            return (
              <div 
                key={symbol}
                className="group flex items-center justify-between p-2.5 rounded-lg bg-slate-800/20 border border-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80 transition-all cursor-pointer"
                onClick={() => onSelect(symbol)}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className={`w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-slate-400 transition-colors ${
                    activeTab === 'indices' ? 'bg-blue-900/20 text-blue-400' : 
                    activeTab === 'stocks' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-slate-700'
                  }`}>
                    <TrendingUp size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-200 group-hover:text-white truncate">{symbol}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-emerald-400/70 flex items-center gap-1 transition-colors">
                      Analyze
                    </div>
                  </div>
                </div>
                
                {activeTab === 'saved' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(symbol);
                    }}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSaved) onAdd(symbol);
                      else onRemove(symbol);
                    }}
                    className={`p-2 rounded transition-all ${
                      isSaved 
                        ? 'text-yellow-400 bg-yellow-400/10 opacity-100' 
                        : 'text-slate-600 hover:text-white hover:bg-slate-700 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isSaved ? "In Watchlist" : "Add to Watchlist"}
                  >
                    {isSaved ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-2 border-t border-slate-800 text-center bg-slate-900/50">
        <p className="text-[9px] text-slate-600">
          {activeTab === 'saved' 
            ? `${watchlist.length} items saved` 
            : "Select an item to analyze or add to watchlist"}
        </p>
      </div>
    </div>
  );
};
