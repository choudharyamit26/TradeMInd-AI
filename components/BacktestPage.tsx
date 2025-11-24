
import React, { useState } from 'react';
import { BacktestMode, Timeframe, TradingStrategy, TradingStyle, BacktestConfig, FullBacktestReport, Trade } from '../types';
import { INDICES, NIFTY_50, NIFTY_100, NIFTY_200, NIFTY_500 } from '../constants';
import { runBacktestSimulation } from '../services/backtestService';
import { Play, TrendingUp, BarChart2, PieChart, Activity, Sliders, CheckSquare, Square, AlertCircle, Calendar, RefreshCcw, Table, FileText } from 'lucide-react';

export const BacktestPage: React.FC = () => {
  // Config State
  const [selectedIndices, setSelectedIndices] = useState<string[]>([]);
  const [availableStocks, setAvailableStocks] = useState<string[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [mode, setMode] = useState<BacktestMode>('SIMPLE');
  const [tradingType, setTradingType] = useState<TradingStyle>('SWING');
  const [capital, setCapital] = useState(100000);
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  
  // Advanced Configs
  const [wfSplit, setWfSplit] = useState(70); // 70% In-sample
  const [mcSims, setMcSims] = useState(1000);

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<FullBacktestReport | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRADES' | 'OPTIMIZATION' | 'MONTE_CARLO'>('OVERVIEW');
  const [selectedStockView, setSelectedStockView] = useState<string>('PORTFOLIO'); // 'PORTFOLIO' or specific symbol

  // Load Strategies
  const strategies: TradingStrategy[] = JSON.parse(localStorage.getItem('tradeMind_strategies') || '[]');

  const handleIndexToggle = (index: string) => {
    let newIndices = [...selectedIndices];
    if (newIndices.includes(index)) newIndices = newIndices.filter(i => i !== index);
    else newIndices.push(index);
    
    setSelectedIndices(newIndices);
    updateAvailableStocks(newIndices);
  };

  const updateAvailableStocks = (indices: string[]) => {
    let stocks: string[] = [];
    if (indices.includes('NIFTY 50')) stocks = [...stocks, ...NIFTY_50];
    if (indices.length === 0) stocks = [];
    else if (indices.includes('NIFTY 500')) stocks = NIFTY_500;
    else if (indices.includes('NIFTY 200')) stocks = NIFTY_200;
    else if (indices.includes('NIFTY 100')) stocks = NIFTY_100;
    else stocks = NIFTY_50; 
    setAvailableStocks([...new Set(stocks)].sort());
  };

  const toggleStock = (stock: string) => {
    if (selectedStocks.includes(stock)) setSelectedStocks(selectedStocks.filter(s => s !== stock));
    else setSelectedStocks([...selectedStocks, stock]);
  };

  const handleRunBacktest = async () => {
    if (selectedStocks.length === 0 || !selectedStrategyId) return;
    setIsRunning(true);
    setReport(null);
    setActiveTab('OVERVIEW');

    const config: BacktestConfig = {
      stocks: selectedStocks,
      indices: selectedIndices,
      strategyId: selectedStrategyId,
      tradingType,
      timeframe,
      mode,
      initialCapital: capital,
      startDate,
      endDate,
      wfSplit: wfSplit / 100,
      mcSimulations: mcSims
    };

    try {
      const results = await runBacktestSimulation(config);
      setReport(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  // Helper to get trades to display (Portfolio vs Single Stock)
  const getDisplayTrades = (): Trade[] => {
    if (!report) return [];
    if (selectedStockView === 'PORTFOLIO') {
      // Flatten all trades
      return Object.values(report.stockResults).flatMap(r => r.trades).sort((a,b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime());
    }
    return report.stockResults[selectedStockView]?.trades || [];
  };

  const getDisplayMetrics = () => {
    if (!report) return null;
    if (selectedStockView === 'PORTFOLIO') return report.overallMetrics;
    return report.stockResults[selectedStockView]?.metrics;
  };

  const displayMetrics = getDisplayMetrics();

  // SVG Equity Chart for smooth rendering
  const EquityChart = ({ data }: { data: number[] }) => {
    if (!data || data.length === 0) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const width = 1000;
    const height = 300;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height * 0.8 - height * 0.1; // Add padding
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
         <defs>
           <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
             <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
             <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
           </linearGradient>
         </defs>
         <path d={`M0,${height} ${points} L${width},${height} Z`} fill="url(#chartGradient)" />
         <path d={`M${points}`} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Configuration Panel (Left) */}
      <div className="w-96 flex-none bg-slate-900/50 border-r border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-bold text-emerald-400 flex items-center gap-2">
            <Sliders size={18} /> Configuration
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          
          {/* 1. Strategy & Capital */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase">Strategy & Capital</label>
            <select 
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none"
            >
              <option value="">-- Select Strategy --</option>
              {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <div className="grid grid-cols-2 gap-2">
               <input 
                 type="number"
                 value={capital}
                 onChange={e => setCapital(Number(e.target.value))}
                 className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm outline-none"
                 placeholder="Capital"
               />
               <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm outline-none"
              >
                <option value="1d">1 Day</option>
                <option value="1h">1 Hour</option>
                <option value="15m">15 Min</option>
              </select>
            </div>
          </div>

          {/* 2. Date Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs outline-none focus:border-emerald-500 text-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs outline-none focus:border-emerald-500 text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* 3. Mode Selection */}
          <div className="space-y-3">
             <label className="text-xs font-semibold text-slate-400 uppercase">Analysis Mode</label>
             <div className="grid grid-cols-2 gap-2">
                {['SIMPLE', 'WALK_FORWARD', 'OPTIMIZATION', 'MONTE_CARLO'].map((m) => (
                  <button 
                    key={m}
                    onClick={() => setMode(m as BacktestMode)}
                    className={`text-[10px] py-2 px-1 rounded border transition-all font-medium ${
                      mode === m 
                        ? 'bg-purple-600 border-purple-500 text-white' 
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
             </div>
             
             {/* Dynamic Mode Settings */}
             {mode === 'WALK_FORWARD' && (
               <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                 <div className="flex justify-between text-xs mb-1">
                   <span>In-Sample: {wfSplit}%</span>
                   <span>Out-Sample: {100-wfSplit}%</span>
                 </div>
                 <input type="range" min="50" max="90" value={wfSplit} onChange={e => setWfSplit(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
               </div>
             )}
             {mode === 'MONTE_CARLO' && (
               <div className="bg-slate-800/50 p-2 rounded border border-slate-700 flex items-center justify-between">
                 <span className="text-xs text-slate-400">Simulations:</span>
                 <select value={mcSims} onChange={e => setMcSims(Number(e.target.value))} className="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1">
                   <option value="100">100</option>
                   <option value="500">500</option>
                   <option value="1000">1000</option>
                   <option value="5000">5000</option>
                 </select>
               </div>
             )}
          </div>

          {/* 4. Universe Selection */}
          <div className="space-y-3">
             <label className="text-xs font-semibold text-slate-400 uppercase">Stock Universe</label>
             
             {/* Indices Dropdown/Toggle */}
             <div className="flex flex-wrap gap-2">
                {['NIFTY 50', 'NIFTY 100', 'NIFTY 200'].map(idx => (
                  <button 
                    key={idx}
                    onClick={() => handleIndexToggle(idx)}
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      selectedIndices.includes(idx) ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-700 text-slate-500'
                    }`}
                  >
                    {idx}
                  </button>
                ))}
             </div>

             {/* Stock Multi-select List */}
             <div className="border border-slate-700 rounded-lg bg-slate-950 h-52 overflow-y-auto p-1">
                {availableStocks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600 px-4 text-center">
                    Select an Index to fetch tickers
                  </div>
                ) : (
                  availableStocks.map(s => (
                    <div 
                      key={s} 
                      onClick={() => toggleStock(s)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 cursor-pointer text-sm"
                    >
                      {selectedStocks.includes(s) ? <CheckSquare size={14} className="text-emerald-400"/> : <Square size={14} className="text-slate-600"/>}
                      <span className={selectedStocks.includes(s) ? 'text-emerald-300' : 'text-slate-400'}>{s}</span>
                    </div>
                  ))
                )}
             </div>
             <div className="text-xs text-right text-emerald-400">{selectedStocks.length} Selected</div>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
           <button 
             onClick={handleRunBacktest}
             disabled={isRunning || !selectedStrategyId || selectedStocks.length === 0}
             className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
               isRunning 
               ? 'bg-slate-800 text-slate-500 cursor-wait' 
               : (!selectedStrategyId || selectedStocks.length === 0) 
                 ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                 : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/20'
             }`}
           >
             {isRunning ? 'Processing Data...' : <><Play size={18}/> Run {mode.replace('_',' ')}</>}
           </button>
        </div>
      </div>

      {/* Results Panel (Right) */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        
        {/* Results Header (Tabs & Stock Selector) */}
        {report && (
          <div className="flex-none p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
             <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button onClick={() => setActiveTab('OVERVIEW')} className={`px-3 py-1.5 text-xs font-medium rounded ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Overview</button>
                <button onClick={() => setActiveTab('TRADES')} className={`px-3 py-1.5 text-xs font-medium rounded ${activeTab === 'TRADES' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Trades Log</button>
                {mode === 'OPTIMIZATION' && <button onClick={() => setActiveTab('OPTIMIZATION')} className={`px-3 py-1.5 text-xs font-medium rounded ${activeTab === 'OPTIMIZATION' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Optimization</button>}
                {mode === 'MONTE_CARLO' && <button onClick={() => setActiveTab('MONTE_CARLO')} className={`px-3 py-1.5 text-xs font-medium rounded ${activeTab === 'MONTE_CARLO' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Monte Carlo</button>}
             </div>
             
             {/* Stock Filter for Detail View */}
             <select 
               value={selectedStockView} 
               onChange={e => setSelectedStockView(e.target.value)}
               className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1.5 outline-none"
             >
               <option value="PORTFOLIO">Full Portfolio Result</option>
               {Object.keys(report.stockResults).sort().map(s => (
                 <option key={s} value={s}>{s}</option>
               ))}
             </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {!report && !isRunning && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Activity size={64} className="mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-slate-500">Ready to Simulate</h3>
              <p className="text-sm opacity-60">Historical data engine ready. Configure and Run.</p>
            </div>
          )}

          {isRunning && (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-emerald-400 font-mono text-sm animate-pulse">Running {mode} Strategy Engine...</p>
            </div>
          )}

          {report && displayMetrics && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'OVERVIEW' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Metric Cards */}
                      <MetricCard label="Net Profit" value={formatCurrency(displayMetrics.netProfit)} color={displayMetrics.netProfit > 0 ? "text-emerald-400" : "text-red-400"} />
                      <MetricCard label="Win Rate" value={`${displayMetrics.winRate}%`} icon={PieChart} />
                      <MetricCard label="Profit Factor" value={displayMetrics.profitFactor.toFixed(2)} icon={TrendingUp} />
                      <MetricCard label="Max Drawdown" value={`-${displayMetrics.maxDrawdown}%`} color="text-red-400" icon={AlertCircle} />
                  </div>

                  {/* Walk Forward Specifics */}
                  {mode === 'WALK_FORWARD' && report.walkForwardResults && selectedStockView === 'PORTFOLIO' && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-900/40 p-4 rounded-xl border border-blue-500/20">
                          <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">In-Sample (Train)</h4>
                          <div className="text-lg font-mono text-white">NP: {formatCurrency(report.walkForwardResults.inSampleMetrics.netProfit)}</div>
                       </div>
                       <div className="bg-slate-900/40 p-4 rounded-xl border border-purple-500/20">
                          <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Out-Sample (Test)</h4>
                          <div className="text-lg font-mono text-white">NP: {formatCurrency(report.walkForwardResults.outSampleMetrics.netProfit)}</div>
                       </div>
                    </div>
                  )}

                  {/* Equity Curve */}
                  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-80 flex flex-col relative overflow-hidden">
                      <div className="flex justify-between items-center mb-4 z-10">
                        <h3 className="text-sm font-semibold text-slate-400">
                          {selectedStockView === 'PORTFOLIO' ? 'Portfolio' : selectedStockView} Equity Curve
                        </h3>
                        <div className="text-xs text-emerald-400 font-mono">
                          Current: {formatCurrency((selectedStockView === 'PORTFOLIO' ? report.equityCurve : report.stockResults[selectedStockView].equityCurve).slice(-1)[0])}
                        </div>
                      </div>
                      <div className="flex-1 w-full z-10 relative">
                        <EquityChart data={selectedStockView === 'PORTFOLIO' ? report.equityCurve : report.stockResults[selectedStockView].equityCurve} />
                      </div>
                      {/* Background Grid */}
                      <div className="absolute inset-0 grid grid-rows-4 grid-cols-4 opacity-10 pointer-events-none z-0">
                         {[...Array(16)].map((_,i) => <div key={i} className="border border-slate-500/20"></div>)}
                      </div>
                  </div>
                </>
              )}

              {/* TRADES TAB */}
              {activeTab === 'TRADES' && (
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-slate-900 text-xs uppercase text-slate-500 font-semibold border-b border-slate-800">
                         <tr>
                           <th className="px-4 py-3">Symbol</th>
                           <th className="px-4 py-3">Type</th>
                           <th className="px-4 py-3">Entry Date</th>
                           <th className="px-4 py-3">Entry Price</th>
                           <th className="px-4 py-3">Exit Price</th>
                           <th className="px-4 py-3">PnL</th>
                           <th className="px-4 py-3">Reason</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                         {getDisplayTrades().map((t) => (
                           <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                             <td className="px-4 py-3 font-medium text-white">{t.symbol}</td>
                             <td className={`px-4 py-3 text-xs font-bold ${t.direction === 'LONG' ? 'text-blue-400' : 'text-purple-400'}`}>{t.direction}</td>
                             <td className="px-4 py-3 text-slate-400 text-xs">{new Date(t.entryDate).toLocaleDateString()}</td>
                             <td className="px-4 py-3 font-mono">₹{t.entryPrice.toFixed(2)}</td>
                             <td className="px-4 py-3 font-mono">₹{t.exitPrice.toFixed(2)}</td>
                             <td className={`px-4 py-3 font-mono font-bold ${t.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                               {t.pnl > 0 ? '+' : ''}{t.pnl.toFixed(2)} ({t.pnlPercent}%)
                             </td>
                             <td className="px-4 py-3 text-xs text-slate-500">{t.exitReason}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              )}

              {/* OPTIMIZATION TAB */}
              {activeTab === 'OPTIMIZATION' && report.optimizationResults && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-300">Parameter Performance</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {report.optimizationResults.map((param, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
                         <div>
                            <div className="text-sm font-semibold text-white">{param.paramName}</div>
                            <div className="text-xs text-slate-500">Value: {param.value}</div>
                         </div>
                         <div className="text-right">
                            <div className={`font-bold ${param.netProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(param.netProfit)}</div>
                            <div className="text-xs text-slate-500">Win Rate: {param.winRate}%</div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MONTE CARLO TAB */}
              {activeTab === 'MONTE_CARLO' && report.monteCarloResults && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
                       <h3 className="font-bold text-slate-300">Simulation Statistics ({report.monteCarloResults.simulationCount} Runs)</h3>
                       <div className="space-y-3">
                          <StatRow label="Best Case Return" value={`${report.monteCarloResults.bestCaseReturn}%`} color="text-emerald-400" />
                          <StatRow label="Worst Case Return" value={`${report.monteCarloResults.worstCaseReturn}%`} color="text-red-400" />
                          <StatRow label="Average Return" value={`${report.monteCarloResults.avgReturn}%`} color="text-blue-400" />
                          <div className="pt-2 border-t border-slate-800">
                             <StatRow label="95% Confidence Level" value={`${report.monteCarloResults.confidence95}%`} color="text-yellow-400" />
                             <p className="text-[10px] text-slate-500 mt-1">There is a 95% probability your return will be above this value.</p>
                          </div>
                       </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center justify-center text-slate-500 text-sm">
                       <div className="text-center">
                         <BarChart2 size={48} className="mx-auto mb-2 opacity-50" />
                         Distribution Visualization
                       </div>
                    </div>
                 </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const MetricCard = ({ label, value, icon: Icon, color = 'text-white' }: any) => (
  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
     <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
       {Icon && <Icon size={12}/>} {label}
     </div>
     <div className={`text-xl font-bold ${color}`}>{value}</div>
  </div>
);

const StatRow = ({ label, value, color }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-400">{label}</span>
    <span className={`font-mono font-bold ${color}`}>{value}</span>
  </div>
);

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};
