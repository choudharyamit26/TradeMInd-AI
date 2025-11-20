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
  newsSummary?: string; // New field for news analysis
  newsSentiment?: 'Positive' | 'Negative' | 'Neutral'; // New field for sentiment
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