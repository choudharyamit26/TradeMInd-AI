
import React, { useState } from 'react';
import { runMarketScan } from '../services/geminiService';
import { ScreenerResult } from '../types';
import { Search, TrendingUp, BarChart2, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface ScreenerPanelProps {
  onSelectStock: (symbol: string) => void;
  onClose: () => void;
}

const SCAN_TYPES = [
  { id: 'VOLUME_BREAKOUT', label: 'Volume Shockers', icon: BarChart2, desc: 'Price spike > 3% with Volume > 2x Avg' },
  { id: 'PATTERN_BREAKOUT', label: 'Chart Patterns', icon: TrendingUp, desc: 'Flag, Pennant, Triangle breakouts' },
  { id: 'MOMENTUM_RSI', label: 'RSI Momentum', icon: Zap, desc: 'RSI crossing 60 with MACD Buy' },
];

export const ScreenerPanel: React.FC<ScreenerPanelProps> = ({ onSelectStock, onClose }) => {
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async (typeId: string, label: string) => {
    setActiveScan(typeId);
    setIsLoading(true);
    setResults([]);
    try {
      const data = await runMarketScan(label);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800 w-full md:w-96 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-1.5 rounded-lg text-purple-400">
            <Search size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">AI Screener</h3>
            <p className="text-[10px] text-slate-400">Scan Nifty 500 for setups</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        
        {/* Scan Types Grid */}
        <div className="grid grid-cols-1 gap-2">
          {SCAN_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleScan(type.id, type.label)}
              disabled={isLoading}
              className={`text-left p-3 rounded-xl border transition-all duration-200 group ${
                activeScan === type.id
                  ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-900/20'
                  : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-200 group-hover:text-purple-300">
                  <type.icon size={16} />
                  {type.label}
                </div>
                {activeScan === type.id && isLoading && <Loader2 size={14} className="animate-spin text-purple-400" />}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">{type.desc}</p>
            </button>
          ))}
        </div>

        {/* Results Area */}
        {activeScan && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              {isLoading ? 'Scanning Market...' : `Results (${results.length})`}
            </h4>

            {isLoading ? (
              <div className="space-y-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-16 bg-slate-900/50 rounded-xl animate-pulse border border-slate-800" />
                 ))}
              </div>
            ) : results.length > 0 ? (
              results.map((stock, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectStock(stock.symbol)}
                  className="bg-slate-900 border border-slate-800 p-3 rounded-xl hover:bg-slate-800 hover:border-purple-500/30 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors">{stock.symbol}</div>
                      <div className="text-xs text-slate-400">{stock.price} <span className="text-emerald-400 ml-1">{stock.change}</span></div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      stock.conviction === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {stock.conviction} Conviction
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-950/50 p-1.5 rounded">
                      <BarChart2 size={10} className="text-slate-500" />
                      {stock.volume}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-950/50 p-1.5 rounded">
                      <TrendingUp size={10} className="text-slate-500" />
                      {stock.pattern}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <AlertCircle size={20} className="mx-auto mb-2 opacity-50" />
                No signals found for this scan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
