
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TradeData, TradingStyle } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

const getSystemInstruction = (mode: string) => `
You are an elite Algorithmic ${mode} Trading Assistant specializing in the Indian Stock Market (NSE/BSE).
Your STRICT objective is to provide "Real-Time" actionable signals based on the latest available data.

### OPERATION PROTOCOL:

1.  **LIVE DATA FETCH (MANDATORY):**
    *   Use Google Search to find the **exact current price** (last traded price).
    *   Verify the data is from **today** (or the last trading session).

2.  **NEWS & SENTIMENT ANALYSIS (Last 14 Days):**
    *   **Search Query:** "[Stock Symbol] news India last 2 weeks".
    *   **Sentiment:** Positive/Negative/Neutral.

3.  **VERIFIABLE TECHNICAL DATA (REQUIRED):**
    *   **Trend & Momentum:** RSI (14), MACD, ADX, and key EMAs (20/50/200).
    *   **Volatility:** **Bollinger Bands** (Status: Squeeze/Expansion/Upper Band/Lower Band) and **ATR** (Average True Range value).
    *   **Support/Resistance:** **Fibonacci Retracement** levels (e.g., 0.382, 0.618 support).
    *   **Patterns:** Candlestick (Hammer, Engulfing) & Chart Patterns (Head & Shoulders, Flags).
    *   **OHLC Data:** Last 3 periods (Days for Swing, 15-min for Intraday).

4.  **SIGNAL GENERATION:**
    *   Decide: **BUY**, **SELL**, or **NEUTRAL/WAIT**.
    *   **Entry:** Precise range.
    *   **Stop Loss:** Technical level.
    *   **Targets:** Min 1:2 Risk-Reward.

### RESPONSE FORMAT:
1.  **Analysis Text (Markdown):** Detailed technical and fundamental breakdown.
2.  **Structured Data (JSON):** A strict JSON block at the VERY END.

**JSON BLOCK STRUCTURE (Raw text in code block):**
\`\`\`json
{
  "symbol": "RELIANCE",
  "currentPrice": "₹2,450.50",
  "signal": "BUY",
  "strategy": "${mode}",
  "confidence": "High",
  "entry": "2440-2450",
  "stopLoss": "2380",
  "targets": ["2550", "2650"],
  "reasoning": "Breakout confirmed by RSI divergence and Fibonacci support.",
  "newsSummary": "Reliance Retail secured massive funding.",
  "newsSentiment": "Positive",
  "technicals": {
    "rsi": "62.5 (Bullish)",
    "macd": "Crossover above zero",
    "adx": "28 (Strong Trend)",
    "ema": "Price > 50 EMA",
    "bb": "Band Expansion (Volatile)",
    "atr": "45.2 (High)",
    "fibonacci": "Retraced to 0.618 level"
  },
  "patterns": {
    "candlestick": ["Bullish Engulfing", "Hammer"],
    "chart": ["Ascending Triangle Breakout"]
  },
  "recentOHLC": [
    {"time": "25 Oct", "open": "2400", "high": "2420", "low": "2390", "close": "2415", "status": "Green"},
    {"time": "26 Oct", "open": "2415", "high": "2440", "low": "2410", "close": "2435", "status": "Green"},
    {"time": "27 Oct", "open": "2435", "high": "2460", "low": "2430", "close": "2450", "status": "Green"}
  ]
}
\`\`\`
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  tradingMode: TradingStyle = 'SWING'
): Promise<{ text: string; sources?: { title: string; uri: string }[]; tradeData?: TradeData }> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: getSystemInstruction(tradingMode),
        temperature: 0.3, 
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4096 }, 
      },
      history: history,
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: `Analyze ${message} for a ${tradingMode} trade. 
      1. Find real-time price. 
      2. Get values for RSI, MACD, EMA, Bollinger Bands, ATR, and Fibonacci. 
      3. List detected Patterns. 
      4. Provide last 3 candles OHLC.`,
    });

    const fullText = result.text || "I couldn't generate a response. Please try again.";
    
    // Extract JSON block
    const jsonRegex = /```json\n([\s\S]*?)\n```/;
    const match = fullText.match(jsonRegex);
    
    let tradeData: TradeData | undefined;
    let displayText = fullText;

    if (match && match[1]) {
      try {
        tradeData = JSON.parse(match[1]);
        // Remove the JSON block from the display text
        displayText = fullText.replace(match[0], '').trim();
      } catch (e) {
        console.error("Failed to parse trade signal JSON:", e);
      }
    }

    // Extract sources
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk) => chunk.web)
      .filter((web) => web !== undefined && web !== null) as { title: string; uri: string }[] | undefined;

    return { text: displayText, sources, tradeData };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
