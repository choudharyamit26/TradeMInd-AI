import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { MessageBubble } from './MessageBubble';
import { Send, RefreshCcw, BarChart2, Search } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      content: "Hello! I'm TradeMind. I can help you analyze Indian stocks for swing trading opportunities.\n\nTry asking: *\"Analyze Tata Motors for a swing trade\"* or *\"Is Reliance looking bullish on the daily chart?\"*",
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare history for the API
      // Convert internal Message type to API history format
      const history = messages.map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await sendMessageToGemini(history, userMessage.content);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: "I encountered an error while analyzing the market data. Please check your connection or try again later.",
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
    "HDFC Bank support levels",
    "SBIN buy or sell?",
    "Nifty 50 trend today"
  ];

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        <div className="flex flex-col pb-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-slate-400 animate-pulse">Analyzing market data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 md:p-6 bg-slate-950 border-t border-slate-800/50 backdrop-blur-sm">
        {/* Suggested Prompts (only show if few messages) */}
        {messages.length < 3 && (
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
            placeholder="Ask about a stock (e.g., 'Analyze Reliance for swing trade')..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none py-3 max-h-32 scrollbar-thin"
            rows={1}
            style={{ minHeight: '44px' }}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
              !inputValue.trim() || isLoading
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
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
               AI can make mistakes. Market data is fetched via Google Search and may be delayed.
             </p>
        </div>
      </div>
    </div>
  );
};