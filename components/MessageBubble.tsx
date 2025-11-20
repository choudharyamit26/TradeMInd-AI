
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Role, Message } from '../types';
import { User, Bot, ExternalLink, TrendingUp, TrendingDown, MinusCircle, Target, ShieldAlert, CircleDollarSign, Clock, Calendar, Star, Newspaper, Activity, BarChart2, ScanLine } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onToggleWatchlist?: (symbol: string) => void;
  watchlist?: string[];
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onToggleWatchlist, watchlist }) => {
  const isUser = message.role === Role.USER;

  // Helper to determine signal colors
  const getSignalStyle = (signal?: string) => {
    switch (signal) {
      case 'BUY': return 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400';
      case 'SELL': return 'bg-red-950/40 border-red-500/50 text-red-400';
      default: return 'bg-slate-800 border-slate-600 text-slate-300';
    }
  };

  const getSignalIcon = (signal?: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'SELL': return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <MinusCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const isInWatchlist = message.tradeData && watchlist?.includes(message.tradeData.symbol);

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg mt-1 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-indigo-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Container */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
          
          {/* TRADE SIGNAL CARD (Only for Bot if data exists) */}
          {!isUser && message.tradeData && (
            <div className={`w-full max-w-md mb-3 rounded-xl border shadow-lg backdrop-blur-sm overflow-hidden ${getSignalStyle(message.tradeData.signal)}`}>
              
              {/* Card Header */}
              <div className="px-4 py-3 bg-black/10 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">{message.tradeData.symbol}</h2>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white/90">
                        {message.tradeData.currentPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className={`text-[10px] font-bold tracking-wider flex items-center gap-1 px-1.5 py-0.5 rounded ${
                         message.tradeData.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 
                         message.tradeData.signal === 'SELL' ? 'bg-red-500/20 text-red-300 border border-red-500/20' : 
                         'bg-slate-500/20 text-slate-300 border border-slate-500/20'
                       }`}>
                         {message.tradeData.signal}
                       </span>
                       <div className="flex items-center gap-1 text-[10px] text-white/60">
                          <span className="flex items-center gap-0.5 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                             {message.tradeData.strategy === 'INTRADAY' ? <Clock size={9} /> : <Calendar size={9} />}
                             {message.tradeData.strategy}
                          </span>
                          <span className="bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                            Conf: {message.tradeData.confidence}
                          </span>
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {onToggleWatchlist && (
                       <button 
                         onClick={() => onToggleWatchlist(message.tradeData!.symbol)}
                         className={`p-2 rounded-lg transition-colors ${isInWatchlist ? 'bg-yellow-400/20 text-yellow-400' : 'bg-black/20 text-slate-400 hover:text-white'}`}
                         title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                       >
                         <Star size={16} fill={isInWatchlist ? "currentColor" : "none"} />
                       </button>
                    )}
                    <div className={`p-2 rounded-lg bg-black/20`}>
                      {getSignalIcon(message.tradeData.signal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 space-y-3">
                
                {/* 1. Entry/Target/Stop Grid */}
                <div className="grid grid-cols-3 gap-2">
                   <div className="flex flex-col bg-black/20 rounded p-2 border border-white/5">
                      <span className="text-[9px] uppercase opacity-60 mb-0.5 flex items-center gap-1"><CircleDollarSign size={10}/> Entry</span>
                      <span className="text-xs font-semibold text-white leading-tight">{message.tradeData.entry}</span>
                   </div>
                   <div className="flex flex-col bg-black/20 rounded p-2 border border-white/5">
                      <span className="text-[9px] uppercase opacity-60 mb-0.5 flex items-center gap-1"><Target size={10}/> Targets</span>
                      <div className="flex flex-col">
                        {message.tradeData.targets.map((t, i) => (
                           <span key={i} className="text-xs font-semibold text-white leading-tight">{t}</span>
                        ))}
                      </div>
                   </div>
                   <div className="flex flex-col bg-black/20 rounded p-2 border border-white/5">
                      <span className="text-[9px] uppercase opacity-60 mb-0.5 flex items-center gap-1"><ShieldAlert size={10}/> Stop</span>
                      <span className="text-xs font-semibold text-white leading-tight">{message.tradeData.stopLoss}</span>
                   </div>
                </div>

                {/* 2. Verifiable Technicals (New) */}
                {(message.tradeData.technicals || (message.tradeData.patterns && (message.tradeData.patterns.candlestick.length > 0 || message.tradeData.patterns.chart.length > 0))) && (
                  <div className="bg-black/10 rounded-lg border border-white/5 p-2">
                     <div className="text-[10px] font-bold opacity-80 mb-2 flex items-center gap-1"><Activity size={12} /> TECHNICAL EVIDENCE</div>
                     
                     {/* Indicators */}
                     {message.tradeData.technicals && (
                       <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-black/20 px-2 py-1 rounded text-[10px] flex justify-between">
                            <span className="opacity-60">RSI</span> <span className="font-mono text-white">{message.tradeData.technicals.rsi}</span>
                          </div>
                          <div className="bg-black/20 px-2 py-1 rounded text-[10px] flex justify-between">
                            <span className="opacity-60">MACD</span> <span className="font-mono text-white">{message.tradeData.technicals.macd}</span>
                          </div>
                          <div className="bg-black/20 px-2 py-1 rounded text-[10px] flex justify-between">
                            <span className="opacity-60">ADX</span> <span className="font-mono text-white">{message.tradeData.technicals.adx}</span>
                          </div>
                          <div className="bg-black/20 px-2 py-1 rounded text-[10px] flex justify-between truncate">
                            <span className="opacity-60">EMA</span> <span className="font-mono text-white truncate ml-2">{message.tradeData.technicals.ema}</span>
                          </div>
                          
                          {/* New Indicators */}
                          {message.tradeData.technicals.bb && (
                             <div className="bg-black/20 px-2 py-1 rounded text-[10px] flex justify-between col-span-2">
                               <span className="opacity-60">B. Bands</span> <span className="font-mono text-white">{message.tradeData.technicals.bb}</span>
                             </div>
                          )}
                          {message.tradeData.technicals.atr && (
                             <div className="bg-black/20 px-2 py-1 rounded text-[10px] flex justify-between">
                               <span className="opacity-60">ATR</span> <span className="font-mono text-white">{message.tradeData.technicals.atr}</span>
                             </div>
                          )}
                           {message.tradeData.technicals.fibonacci && (
                             <div className="bg-black/20 px-2 py-1 rounded text-[10px] flex justify-between">
                               <span className="opacity-60">Fib</span> <span className="font-mono text-white">{message.tradeData.technicals.fibonacci}</span>
                             </div>
                          )}
                       </div>
                     )}

                     {/* Patterns */}
                     {message.tradeData.patterns && (
                       <div className="flex flex-wrap gap-1">
                          {message.tradeData.patterns.candlestick?.map((p, i) => (
                             <span key={`c-${i}`} className="text-[9px] bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                               <ScanLine size={9} /> {p}
                             </span>
                          ))}
                          {message.tradeData.patterns.chart?.map((p, i) => (
                             <span key={`ch-${i}`} className="text-[9px] bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                               <BarChart2 size={9} /> {p}
                             </span>
                          ))}
                       </div>
                     )}
                  </div>
                )}

                {/* 3. OHLC Data */}
                {message.tradeData.recentOHLC && message.tradeData.recentOHLC.length > 0 && (
                  <div className="bg-black/10 rounded-lg border border-white/5 p-2 overflow-hidden">
                     <div className="text-[10px] font-bold opacity-80 mb-1.5">RECENT PRICE ACTION</div>
                     <table className="w-full text-[9px] text-left border-collapse">
                       <thead>
                         <tr className="text-slate-500 border-b border-white/5">
                           <th className="pb-1 pl-1">Time</th>
                           <th className="pb-1">Open</th>
                           <th className="pb-1">High</th>
                           <th className="pb-1">Low</th>
                           <th className="pb-1 pr-1 text-right">Close</th>
                         </tr>
                       </thead>
                       <tbody>
                         {message.tradeData.recentOHLC.map((row, i) => (
                           <tr key={i} className="border-b border-white/5 last:border-0 text-slate-300">
                             <td className="py-1 pl-1 font-mono opacity-70">{row.time}</td>
                             <td className="py-1 font-mono">{row.open}</td>
                             <td className="py-1 font-mono">{row.high}</td>
                             <td className="py-1 font-mono">{row.low}</td>
                             <td className={`py-1 pr-1 font-mono text-right font-semibold ${
                               row.status === 'Green' ? 'text-emerald-400' : 'text-red-400'
                             }`}>{row.close}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
                )}

                {/* 4. News Insights */}
                {message.tradeData.newsSummary && (
                  <div className={`rounded-lg border p-2.5 ${
                    message.tradeData.newsSentiment?.toLowerCase().includes('positive') ? 'bg-emerald-900/10 border-emerald-500/10' :
                    message.tradeData.newsSentiment?.toLowerCase().includes('negative') ? 'bg-red-900/10 border-red-500/10' :
                    'bg-yellow-900/10 border-yellow-500/10'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90">
                        <Newspaper size={12} /> MARKET CONTEXT
                      </div>
                      {message.tradeData.newsSentiment && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                          message.tradeData.newsSentiment.toLowerCase().includes('positive') ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                          message.tradeData.newsSentiment.toLowerCase().includes('negative') ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                          'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
                        }`}>
                          {message.tradeData.newsSentiment}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-snug opacity-80 text-slate-200 border-l-2 pl-2 border-white/10">
                      {message.tradeData.newsSummary}
                    </p>
                  </div>
                )}
                
                {/* Reasoning Footer */}
                <div className="text-[11px] leading-relaxed opacity-70 italic border-t border-white/10 pt-2 mt-1">
                  "{message.tradeData.reasoning}"
                </div>
              </div>
            </div>
          )}

          {/* Text Content Bubble */}
          <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-md w-full ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
          }`}>
            <ReactMarkdown 
              className="markdown-content space-y-3"
              components={{
                strong: ({node, ...props}) => <span className="font-bold text-emerald-400" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2 text-slate-100 border-b border-slate-700 pb-1" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 ml-1" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Sources Section (Bot Only) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 bg-slate-900/50 border border-slate-800 rounded-lg p-3 w-full">
              <p className="text-xs text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <ExternalLink size={10} />
                VERIFIED SOURCES
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.slice(0, 4).map((source, index) => (
                  <a 
                    key={index}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-500 border border-slate-700 px-2 py-1 rounded transition-colors truncate max-w-[200px] flex items-center gap-1"
                    title={source.title}
                  >
                    {source.title || new URL(source.uri).hostname}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <span className="text-[10px] text-slate-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
