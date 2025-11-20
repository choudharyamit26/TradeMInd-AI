
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export type TradingStyle = 'INTRADAY' | 'SWING';

export interface TradeData {
  symbol: string;
  currentPrice: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL' | 'WAIT';
  confidence: string; // e.g., "High", "Medium"
  strategy: string;
  entry: string;
  stopLoss: string;
  targets: string[];
  reasoning: string;
  newsSummary?: string; 
  newsSentiment?: 'Positive' | 'Negative' | 'Neutral';
  
  // New Verifiable Data Fields
  technicals: {
    rsi: string;
    macd: string;
    adx: string;
    ema: string; // e.g. "50 EMA: 2400"
    bb?: string; // Bollinger Bands
    atr?: string; // Average True Range
    fibonacci?: string; // Key levels
  };
  patterns: {
    candlestick: string[]; // e.g. ["Hammer", "Doji"]
    chart: string[]; // e.g. ["Double Bottom", "Flag"]
  };
  recentOHLC: Array<{
    time: string; // "10:00" or "27 Oct"
    open: string;
    high: string;
    low: string;
    close: string;
    status: 'Green' | 'Red';
  }>;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
  tradeData?: TradeData;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
