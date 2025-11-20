import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Role, Message } from '../types';
import { User, Bot, ExternalLink, TrendingUp, TrendingDown, MinusCircle, Target, ShieldAlert, CircleDollarSign, Clock, Calendar, Star } from 'lucide-react';

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
            <div className={`w-full max-w-md mb-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm ${getSignalStyle(message.tradeData.signal)}`}>
              <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{message.tradeData.symbol}</h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 border border-white/10">
                      {message.tradeData.currentPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold tracking-wider flex items-center gap-1`}>
                      {message.tradeData.signal}
                    </span>
                    <span className="text-[10px] opacity-70 px-1.5 py-0.5 bg-black/20 rounded border border-white/5 flex items-center gap-1">
                      {message.tradeData.strategy === 'INTRADAY' ? <Clock size={8} /> : <Calendar size={8} />}
                      {message.tradeData.strategy}
                    </span>
                    <span className="text-[10px] opacity-70 px-1.5 py-0.5 bg-black/20 rounded">
                      Conf: {message.tradeData.confidence}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onToggleWatchlist && onToggleWatchlist(message.tradeData!.symbol)}
                    className={`p-2 rounded-lg transition-colors ${isInWatchlist ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/40 hover:text-white bg-black/20 hover:bg-black/40'}`}
                    title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    <Star size={18} fill={isInWatchlist ? "currentColor" : "none"} />
                  </button>
                  <div className={`p-2 rounded-lg bg-black/20`}>
                    {getSignalIcon(message.tradeData.signal)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1 text-[10px] opacity-70 mb-1">
                    <CircleDollarSign size={10} /> ENTRY
                  </div>
                  <div className="font-semibold text-white">{message.tradeData.entry}</div>
                </div>
                <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1 text-[10px] opacity-70 mb-1">
                    <Target size={10} /> TARGETS
                  </div>
                  <div className="font-semibold text-white flex flex-col leading-tight">
                    {message.tradeData.targets.map((t, i) => <span key={i}>{t}</span>)}
                  </div>
                </div>
                <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1 text-[10px] opacity-70 mb-1">
                    <ShieldAlert size={10} /> STOP LOSS
                  </div>
                  <div className="font-semibold text-white">{message.tradeData.stopLoss}</div>
                </div>
              </div>
              
              <div className="mt-3 text-xs opacity-80 border-t border-white/10 pt-2 italic">
                "{message.tradeData.reasoning}"
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
