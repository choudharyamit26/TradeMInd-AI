
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

export interface ScreenerResult {
  symbol: string;
  price: string;
  change: string; // e.g. "+4.5%"
  volume: string; // e.g. "2.5x Avg"
  pattern: string; // e.g. "Cup and Handle Breakout"
  conviction: 'High' | 'Medium' | 'Low';
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

// --- STRATEGY BUILDER TYPES ---

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  type: TradingStyle;
  indicators: string[]; // e.g. ["RSI", "MACD", "EMA 200"]
  candlestickPatterns: string[];
  chartPatterns: string[];
  entryRules: string;
  exitRules: string;
  stopLossRules: string;
  createdDate: number;
}

// --- BACKTEST TYPES ---

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M' | '1y';

export type BacktestMode = 'SIMPLE' | 'WALK_FORWARD' | 'OPTIMIZATION' | 'MONTE_CARLO';

export interface Trade {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  entryReason: string;
  exitReason: string;
  status: 'WIN' | 'LOSS';
}

export interface BacktestMetrics {
  totalTrades: number;
  winRate: number;
  netProfit: number;
  profitFactor: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
}

export interface BacktestResult {
  stock: string;
  equityCurve: number[];
  trades: Trade[];
  metrics: BacktestMetrics;
}

export interface OptimizationParam {
  paramName: string;
  value: string | number;
  netProfit: number;
  winRate: number;
}

export interface MonteCarloStats {
  simulationCount: number;
  bestCaseReturn: number;
  worstCaseReturn: number;
  avgReturn: number;
  confidence95: number; // 95% chance return will be above this
}

export interface FullBacktestReport {
  overallMetrics: BacktestMetrics;
  stockResults: Record<string, BacktestResult>; // Results per stock
  equityCurve: number[];
  optimizationResults?: OptimizationParam[];
  monteCarloResults?: MonteCarloStats;
  walkForwardResults?: {
    inSampleMetrics: BacktestMetrics;
    outSampleMetrics: BacktestMetrics;
  };
}

export interface BacktestConfig {
  stocks: string[];
  indices?: string[];
  strategyId: string;
  tradingType: TradingStyle;
  timeframe: Timeframe;
  mode: BacktestMode;
  initialCapital: number;
  startDate?: string;
  endDate?: string;
  // Advanced Settings
  wfSplit?: number; // Walk Forward Split (e.g. 0.7 for 70/30)
  mcSimulations?: number; // Monte Carlo runs
}
