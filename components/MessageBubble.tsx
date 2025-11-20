import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Role, Message } from '../types';
import { User, Bot, ExternalLink, TrendingUp, AlertTriangle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
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
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Sources Section (Bot Only) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 bg-slate-900/50 border border-slate-800 rounded-lg p-3 w-full max-w-md">
              <p className="text-xs text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <ExternalLink size={10} />
                SOURCES
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.slice(0, 4).map((source, index) => (
                  <a 
                    key={index}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-500 border border-slate-700 px-2 py-1 rounded transition-colors truncate max-w-[150px]"
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