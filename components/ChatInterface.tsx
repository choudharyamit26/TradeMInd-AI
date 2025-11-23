
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, TradingStyle } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { MessageBubble } from './MessageBubble';
import { WatchlistPanel } from './WatchlistPanel';
import { TradingViewChart } from './TradingViewChart';
import { ScreenerPanel } from './ScreenerPanel'; // Import Screener
import { Send, RefreshCcw, BarChart2, Clock, Calendar, Menu, X, RefreshCw, CandlestickChart, ScanLine } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      content: "Hello! I'm TradeMind AI. I analyze **real-time market data** for the Indian Stock Market.\n\nSelect your trading style above and give me a stock symbol (e.g., *RELINFRA*, *NIFTY*, *HDFCBANK*).",
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tradingMode, setTradingMode] = useState<TradingStyle>('SWING');
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('tradeMind_watchlist');
    return saved ? JSON.parse(saved) : ['NIFTY 50', 'BANKNIFTY', 'RELIANCE'];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isScreenerOpen, setIsScreenerOpen] = useState(false); // Screener state
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist watchlist
  useEffect(() => {
    localStorage.setItem('tradeMind_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const handleAddToWatchlist = (symbol: string) => {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!watchlist.includes(cleanSymbol)) {
      setWatchlist(prev => [...prev, cleanSymbol]);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  };

  const handleToggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      handleRemoveFromWatchlist(symbol);
    } else {
      handleAddToWatchlist(symbol);
    }
  };

  const getLastAnalyzedSymbol = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].tradeData?.symbol) {
        return messages[i].tradeData.symbol;
      }
    }
    return null;
  };

  const activeSymbol = getLastAnalyzedSymbol();

  const handleRefresh = async () => {
    const symbol = getLastAnalyzedSymbol();
    if (!symbol || isLoading) return;

    setIsLoading(true);
    
    try {
      const history = messages.map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await sendMessageToGemini(
        history, 
        `Update analysis for ${symbol} in ${tradingMode} mode. Fetch latest real-time price and technicals.`, 
        tradingMode
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources,
        tradeData: response.tradeData
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: "I encountered an error while refreshing the data. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    if (isScreenerOpen) setIsScreenerOpen(false); // Close screener if open

    try {
      const history = messages.map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await sendMessageToGemini(history, userMessage.content, tradingMode);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources,
        tradeData: response.tradeData
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: "I encountered an error while analyzing the market data. Please check your internet connection or API key.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    "Analyze Tata Motors",
    "HDFC Bank outlook?",
    "Nifty 50 prediction",
    "Bajaj Finance setup"
  ];

  const canRefresh = getLastAnalyzedSymbol() !== null;

  return (
    <div className="flex h-full max-h-screen overflow-hidden relative">
      
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full w-full transition-all duration-300 relative">
        
        {/* Mode Toggle Bar */}
        <div className="flex-none flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm">
           <div className="flex-1"></div>
           <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1 shadow-sm">
            <button 
              onClick={() => setTradingMode('INTRADAY')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                tradingMode === 'INTRADAY' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Clock size={14} />
              Intraday
            </button>
            <button 
              onClick={() => setTradingMode('SWING')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                tradingMode === 'SWING' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Calendar size={14} />
              Swing
            </button>
            
            <div className="w-px h-5 bg-slate-700 mx-1"></div>

            {/* Screener Toggle */}
            <button
              onClick={() => setIsScreenerOpen(!isScreenerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 group ${
                 isScreenerOpen
                 ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="AI Market Screener"
            >
              <ScanLine size={14} />
              <span className="hidden sm:inline text-xs font-medium">Scan</span>
            </button>

            {/* Chart Toggle */}
            <button
              onClick={() => setIsChartOpen(!isChartOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 group ${
                 isChartOpen
                 ? 'bg-slate-700 text-white'
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title={isChartOpen ? "Close Chart" : "Open Technical Chart"}
            >
              <CandlestickChart size={14} />
              <span className="hidden sm:inline text-xs font-medium">{isChartOpen ? 'Hide' : 'Chart'}</span>
            </button>

            <div className="w-px h-5 bg-slate-700 mx-1"></div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={!canRefresh || isLoading}
              className={`flex items-center justify-center px-3 py-1.5 rounded-md transition-all duration-200 group relative ${
                 !canRefresh || isLoading
                 ? 'text-slate-600 cursor-not-allowed'
                 : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50'
              }`}
              title={`Refresh analysis for ${activeSymbol || 'current stock'}`}
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="flex-1 flex justify-end md:hidden">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Content Container: Chat + Chart */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Chart Panel (Collapsible) */}
          {isChartOpen && (
             <div className="flex-none h-[55vh] border-b border-slate-800 bg-slate-950 relative shadow-2xl z-10 animate-in slide-in-from-top-10 duration-300">
                <div className="absolute top-2 right-2 z-20">
                   <button 
                     onClick={() => setIsChartOpen(false)}
                     className="p-1 rounded bg-slate-800/80 text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors"
                   >
                     <X size={16} />
                   </button>
                </div>
                <TradingViewChart symbol={activeSymbol || "NIFTY 50"} theme="dark" />
             </div>
          )}

          {/* Screener Panel (Overlay) */}
          {isScreenerOpen && (
            <div className="absolute top-0 right-0 bottom-0 z-30 animate-in slide-in-from-right-10 duration-300 shadow-2xl">
              <ScreenerPanel 
                onSelectStock={(symbol) => {
                  setIsScreenerOpen(false);
                  handleSend(`Analyze ${symbol} for ${tradingMode} trade. Check for breakout.`);
                }}
                onClose={() => setIsScreenerOpen(false)}
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            <div className="flex flex-col pb-4">
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-slate-400 animate-pulse">Scanning live market data ({tradingMode})...</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <BarChart2 size={12} />
                      Analyzing {tradingMode === 'INTRADAY' ? '5m/15m timeframe' : 'daily/weekly timeframe'}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 md:p-6 bg-slate-950 border-t border-slate-800/50 backdrop-blur-sm z-20">
          {/* Suggested Prompts - Hide if chart/screener is open to save space */}
          {messages.length < 3 && !isChartOpen && !isScreenerOpen && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(prompt)}
                  className="flex-shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-400 hover:text-emerald-400 rounded-full transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="relative max-w-4xl mx-auto flex items-end gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all shadow-xl">
            <button 
              onClick={() => setMessages([messages[0]])}
              className="p-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <RefreshCcw size={18} />
            </button>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter symbol for ${tradingMode} analysis...`}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none py-3 max-h-32 scrollbar-thin"
              rows={1}
              style={{ minHeight: '44px' }}
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className={`p-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
                !inputValue.trim() || isLoading
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : tradingMode === 'INTRADAY' 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <div className="text-center mt-2">
              <p className="text-[10px] text-slate-600">
                Active Mode: <span className={tradingMode === 'INTRADAY' ? "text-blue-400" : "text-emerald-400"}>{tradingMode}</span>. Data sourced via Google Search. Prices may be delayed.
              </p>
          </div>
        </div>
      </div>

      {/* Sidebar (Watchlist) */}
      <div className={`
        fixed inset-y-0 right-0 z-20 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:flex
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <WatchlistPanel 
          watchlist={watchlist}
          onAdd={handleAddToWatchlist}
          onRemove={handleRemoveFromWatchlist}
          onSelect={(symbol) => handleSend(`Analyze ${symbol} for ${tradingMode} trade`)}
          tradingMode={tradingMode}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
