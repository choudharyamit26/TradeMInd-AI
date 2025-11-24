import React, { useState, useEffect } from 'react';
import { TradingStrategy, TradingStyle } from '../types';
import { Save, Trash2, Edit3, Plus, Settings, ChevronRight, Check, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from 'lucide-react';

export const StrategyBuilder: React.FC = () => {
  const [strategies, setStrategies] = useState<TradingStrategy[]>(() => {
    const saved = localStorage.getItem('tradeMind_strategies');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeStrategy, setActiveStrategy] = useState<TradingStrategy | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<TradingStyle>('SWING');
  const [direction, setDirection] = useState<'LONG' | 'SHORT' | 'BOTH'>('LONG');
  const [indicators, setIndicators] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [entryRules, setEntryRules] = useState('');
  const [exitRules, setExitRules] = useState('');
  const [stopLossRules, setStopLossRules] = useState('');

  const INDICATOR_OPTIONS = ["EMA 9", "EMA 20", "EMA 50", "EMA 200", "RSI 14", "MACD", "Bollinger Bands", "VWAP", "Supertrend", "ATR", "ADX", "Pivot Points", "Fibonacci", "Ichimoku Cloud", "Stochastics"];
  const PATTERN_OPTIONS = ["Hammer", "Shooting Star", "Engulfing", "Doji", "Morning/Evening Star", "Head & Shoulders", "Flag", "Triangle", "Double Top/Bottom", "Cup & Handle", "Wedge"];

  // --- EXPANDED PRESETS ---
  
  const ENTRY_PRESETS = [
    // LONG STRATEGIES
    "[LONG] Price crosses above 50 EMA with Volume > 1.5x Avg",
    "[LONG] RSI crosses above 30 (Oversold Reversal)",
    "[LONG] MACD Line crosses above Signal Line (Golden Cross)",
    "[LONG] Price closes above Upper Bollinger Band (Volatility Breakout)",
    "[LONG] Bullish Engulfing pattern at Key Support Level",
    "[LONG] Breakout of previous Day/Week High",
    "[LONG] Price bounces off VWAP with Green Candle",
    "[LONG] 9 EMA crosses above 21 EMA (Momentum Buy)",
    "[LONG] Supertrend turns Green (Trend Following)",
    "[LONG] Price retraces to 0.618 Fibonacci level and forms Hammer",
    // SHORT STRATEGIES
    "[SHORT] Price crosses below 50 EMA with Volume > 1.5x Avg",
    "[SHORT] RSI crosses below 70 (Overbought Reversal)",
    "[SHORT] MACD Line crosses below Signal Line (Death Cross)",
    "[SHORT] Price closes below Lower Bollinger Band (Volatility Breakdown)",
    "[SHORT] Bearish Engulfing pattern at Key Resistance Level",
    "[SHORT] Breakdown of previous Day/Week Low",
    "[SHORT] Price rejects VWAP with Red Candle",
    "[SHORT] 9 EMA crosses below 21 EMA (Momentum Sell)",
    "[SHORT] Supertrend turns Red (Trend Following)",
    "[SHORT] Double Top formation with Neckline Breakdown"
  ];

  const STOP_LOSS_PRESETS = [
    // LONG SL
    "[LONG] Just below the recent Swing Low",
    "[LONG] Low of the Entry Signal Candle",
    "[LONG] Close below 20 EMA",
    "[LONG] 1.5x ATR below Entry Price (Volatility Based)",
    "[LONG] Fixed 1% Risk per trade",
    "[LONG] Close below Supertrend Support Line",
    "[LONG] Below the 0.618 Fibonacci Retracement",
    // SHORT SL
    "[SHORT] Just above the recent Swing High",
    "[SHORT] High of the Entry Signal Candle",
    "[SHORT] Close above 20 EMA",
    "[SHORT] 1.5x ATR above Entry Price (Volatility Based)",
    "[SHORT] Close above Supertrend Resistance Line"
  ];

  const EXIT_PRESETS = [
    // PROFIT TARGETS
    "Fixed Risk:Reward Ratio of 1:2",
    "Fixed Risk:Reward Ratio of 1:3",
    "Fixed 5% Profit Target",
    "Next Major Pivot Point / Resistance Level",
    "Fibonacci Extension Level 1.618",
    // DYNAMIC EXITS (LONG)
    "[LONG] RSI crosses above 70 (Overbought)",
    "[LONG] Price crosses below 9 EMA (Loss of Momentum)",
    "[LONG] Trailing Stop using Supertrend",
    "[LONG] Bearish Reversal Pattern (Shooting Star/Engulfing)",
    "[LONG] Price hits Upper Bollinger Band",
    // DYNAMIC EXITS (SHORT)
    "[SHORT] RSI crosses below 30 (Oversold)",
    "[SHORT] Price crosses above 9 EMA (Loss of Momentum)",
    "[SHORT] Bullish Reversal Pattern (Hammer/Engulfing)",
    "[SHORT] Price hits Lower Bollinger Band"
  ];

  useEffect(() => {
    localStorage.setItem('tradeMind_strategies', JSON.stringify(strategies));
  }, [strategies]);

  const resetForm = () => {
    setName('');
    setDesc('');
    setType('SWING');
    setDirection('LONG');
    setIndicators([]);
    setPatterns([]);
    setEntryRules('');
    setExitRules('');
    setStopLossRules('');
    setActiveStrategy(null);
  };

  const loadStrategy = (s: TradingStrategy) => {
    setActiveStrategy(s);
    setName(s.name);
    setDesc(s.description);
    setType(s.type);
    setDirection('LONG'); // Defaulting to LONG as direction isn't in legacy type
    setIndicators(s.indicators);
    setPatterns([...s.candlestickPatterns, ...s.chartPatterns]);
    setEntryRules(s.entryRules);
    setExitRules(s.exitRules);
    setStopLossRules(s.stopLossRules);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    // Append direction to description if not supported by type yet
    const finalDesc = direction === 'BOTH' ? `[Bi-directional] ${desc}` : `[${direction}] ${desc}`;

    const newStrategy: TradingStrategy = {
      id: activeStrategy ? activeStrategy.id : Date.now().toString(),
      name,
      description: finalDesc,
      type,
      indicators,
      candlestickPatterns: patterns, 
      chartPatterns: [],
      entryRules,
      exitRules,
      stopLossRules,
      createdDate: Date.now()
    };

    if (activeStrategy) {
      setStrategies(strategies.map(s => s.id === activeStrategy.id ? newStrategy : s));
    } else {
      setStrategies([...strategies, newStrategy]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setStrategies(strategies.filter(s => s.id !== id));
    if (activeStrategy?.id === id) resetForm();
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const applyPreset = (setter: (val: string) => void, currentVal: string, preset: string) => {
    if (!preset) return;
    const newValue = currentVal ? `${currentVal}\n- ${preset}` : `- ${preset}`;
    setter(newValue);
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-emerald-400">My Strategies</h2>
          <button onClick={resetForm} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg" title="New Strategy">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {strategies.length === 0 && (
            <div className="text-center text-slate-500 text-sm mt-10">
              <Settings size={32} className="mx-auto mb-2 opacity-50" />
              No strategies found.<br/>Create your first one!
            </div>
          )}
          {strategies.map(s => (
            <div 
              key={s.id} 
              onClick={() => loadStrategy(s)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeStrategy?.id === s.id 
                  ? 'bg-emerald-900/20 border-emerald-500/50' 
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm">{s.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.type === 'INTRADAY' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {s.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Builder Form */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Settings className="text-emerald-400" />
              {activeStrategy ? 'Edit Strategy' : 'New Strategy'}
            </h1>
            <div className="flex gap-3">
              {activeStrategy && (
                <button onClick={() => handleDelete(activeStrategy.id)} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2">
                  <Trash2 size={16} /> Delete
                </button>
              )}
              <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 font-semibold shadow-lg shadow-emerald-900/20">
                <Save size={16} /> Save Strategy
              </button>
            </div>
          </div>

          {/* Section 1: General */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">1. General Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Strategy Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. 50 EMA Breakout Strategy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Settings (Type & Direction) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Trade Settings</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Intraday/Swing */}
                  <div className="flex flex-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
                    <button 
                      onClick={() => setType('INTRADAY')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded ${type === 'INTRADAY' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Intraday
                    </button>
                    <button 
                      onClick={() => setType('SWING')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded ${type === 'SWING' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Swing
                    </button>
                  </div>

                  {/* Long/Short/Both */}
                  <div className="flex flex-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
                     <button 
                      onClick={() => setDirection('LONG')}
                      className={`flex-1 py-1.5 text-[10px] font-semibold rounded flex items-center justify-center gap-1 ${direction === 'LONG' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Long
                    </button>
                    <button 
                      onClick={() => setDirection('SHORT')}
                      className={`flex-1 py-1.5 text-[10px] font-semibold rounded flex items-center justify-center gap-1 ${direction === 'SHORT' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Short
                    </button>
                    <button 
                      onClick={() => setDirection('BOTH')}
                      className={`flex-1 py-1.5 text-[10px] font-semibold rounded flex items-center justify-center gap-1 ${direction === 'BOTH' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Both
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-xs font-medium text-slate-400">Description / Notes</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Describe the core logic, timeframes, and best market conditions for this strategy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm h-20 resize-none focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Technicals */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">2. Technical Components</h3>
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-400">Indicators used</label>
              <div className="flex flex-wrap gap-2">
                {INDICATOR_OPTIONS.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => toggleSelection(opt, indicators, setIndicators)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      indicators.includes(opt) 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-medium text-slate-400">Patterns used</label>
              <div className="flex flex-wrap gap-2">
                {PATTERN_OPTIONS.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => toggleSelection(opt, patterns, setPatterns)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      patterns.includes(opt) 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300' 
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Logic */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-lg font-semibold text-slate-300">3. Trading Rules</h3>
              <button onClick={() => { setEntryRules(''); setStopLossRules(''); setExitRules(''); }} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                <RefreshCcw size={12} /> Clear Rules
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              
              {/* ENTRY */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <ArrowUpCircle size={14}/> Entry Conditions
                  </label>
                  <select 
                    onChange={(e) => {
                      applyPreset(setEntryRules, entryRules, e.target.value);
                      e.target.value = ""; 
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded px-3 py-1.5 outline-none focus:border-emerald-500 cursor-pointer max-w-[200px] truncate"
                  >
                    <option value="">+ Add Rule Preset...</option>
                    {ENTRY_PRESETS.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
                <textarea 
                  value={entryRules}
                  onChange={e => setEntryRules(e.target.value)}
                  placeholder="Define your Long/Short entry criteria here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm h-32 focus:border-emerald-500 focus:outline-none font-mono text-slate-300 leading-relaxed"
                />
              </div>
              
              {/* STOP LOSS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <label className="text-xs font-bold text-red-400 flex items-center gap-2">
                    <ArrowDownCircle size={14}/> Stop Loss Logic
                  </label>
                  <select 
                    onChange={(e) => {
                      applyPreset(setStopLossRules, stopLossRules, e.target.value);
                      e.target.value = "";
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded px-3 py-1.5 outline-none focus:border-red-500 cursor-pointer max-w-[200px] truncate"
                  >
                    <option value="">+ Add Rule Preset...</option>
                    {STOP_LOSS_PRESETS.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
                <textarea 
                  value={stopLossRules}
                  onChange={e => setStopLossRules(e.target.value)}
                  placeholder="Define risk management and stop placement..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm h-24 focus:border-red-500 focus:outline-none font-mono text-slate-300 leading-relaxed"
                />
              </div>

              {/* EXIT */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-2">
                    <Check size={14}/> Take Profit / Exit
                  </label>
                  <select 
                    onChange={(e) => {
                      applyPreset(setExitRules, exitRules, e.target.value);
                      e.target.value = "";
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer max-w-[200px] truncate"
                  >
                    <option value="">+ Add Rule Preset...</option>
                    {EXIT_PRESETS.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
                <textarea 
                  value={exitRules}
                  onChange={e => setExitRules(e.target.value)}
                  placeholder="Define profit targets and trailing stop logic..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm h-24 focus:border-blue-500 focus:outline-none font-mono text-slate-300 leading-relaxed"
                />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};