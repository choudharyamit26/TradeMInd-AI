import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        // Format symbol: If it doesn't have an exchange, assume NSE
        let formattedSymbol = symbol.toUpperCase();
        // Handle Indices
        if (formattedSymbol === 'NIFTY' || formattedSymbol === 'NIFTY 50') formattedSymbol = 'NSE:NIFTY';
        else if (formattedSymbol === 'BANKNIFTY') formattedSymbol = 'NSE:BANKNIFTY';
        else if (formattedSymbol === 'SENSEX') formattedSymbol = 'BSE:SENSEX';
        else if (!formattedSymbol.includes(':')) {
          formattedSymbol = `NSE:${formattedSymbol}`;
        }

        new (window as any).TradingView.widget({
          "width": "100%",
          "height": "100%",
          "symbol": formattedSymbol,
          "interval": "D",
          "timezone": "Asia/Kolkata",
          "theme": theme,
          "style": "1", // Candlesticks
          "locale": "in",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "details": true, // Show details (technicals)
          "hotlist": true,
          "calendar": true,
          "studies": [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies",
            "BB@tv-basicstudies" // Bollinger Bands
          ],
          "container_id": containerRef.current?.id
        });
      }
    };
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div className="w-full h-full flex flex-col">
      <div id="tradingview_widget_container" ref={containerRef} className="w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl" style={{ minHeight: '500px' }} />
    </div>
  );
};