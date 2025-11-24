import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { StrategyBuilder } from './components/StrategyBuilder';
import { BacktestPage } from './components/BacktestPage';
import { TrendingUp, Activity, MessageSquare, Settings, PlayCircle } from 'lucide-react';

type View = 'CHAT' | 'STRATEGY' | 'BACKTEST';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('CHAT');

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="flex-none border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                TradeMind AI
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Indian Market Assistant
              </p>
            </div>
          </div>
          
          {/* Main Navigation */}
          <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
             <button 
               onClick={() => setCurrentView('CHAT')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 currentView === 'CHAT' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
               }`}
             >
               <MessageSquare size={16} /> Chat
             </button>
             <button 
               onClick={() => setCurrentView('STRATEGY')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 currentView === 'STRATEGY' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
               }`}
             >
               <Settings size={16} /> Strategy
             </button>
             <button 
               onClick={() => setCurrentView('BACKTEST')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 currentView === 'BACKTEST' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
               }`}
             >
               <PlayCircle size={16} /> Backtest
             </button>
          </nav>

          <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Gemini 2.0 Flash</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="h-full max-w-[90rem] mx-auto w-full relative z-0">
          {currentView === 'CHAT' && <ChatInterface />}
          {currentView === 'STRATEGY' && <StrategyBuilder />}
          {currentView === 'BACKTEST' && <BacktestPage />}
        </div>
      </main>
    </div>
  );
};

export default App;
