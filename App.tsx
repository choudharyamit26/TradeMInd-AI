import React from 'react';
import { ChatInterface } from './components/ChatInterface';
import { TrendingUp, Activity } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="flex-none border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                Indian Market Assistant (Intraday & Swing)
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Gemini 3 Pro</span>
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Real-time Search</span>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        {/* Expanded max-width to support side-by-side chat and watchlist */}
        <div className="h-full max-w-[90rem] mx-auto w-full">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
};

export default App;
