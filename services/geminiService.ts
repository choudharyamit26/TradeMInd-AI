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
    *   Use Google Search to find the **exact current price** (last traded price) of the stock.
    *   Verify the data is from **today** (or the last trading session if market is closed).
    *   Check for real-time intraday volatility and volume spikes.

2.  **ADVANCED TECHNICAL ANALYSIS (REQUIRED):**
    Perform a deep-dive using the following indicators:
    *   **Trend & Momentum:**
        *   **EMA:** Analyze price relative to 9, 21, 50, and 200 EMAs. Look for Crossovers (Golden/Death Cross).
        *   **ADX (Avg Directional Index):** Confirm trend strength (ADX > 25 indicates strong trend).
        *   **RSI & MACD:** Identify Overbought/Oversold zones and Divergences.
    *   **Volatility & Risk:**
        *   **Bollinger Bands:** Identify squeezes (potential breakout) or band walks.
        *   **ATR (Average True Range):** Calculate volatility-based Stop Loss levels.
    *   **Support & Resistance:**
        *   **Pivot Points:** Identify CPR, R1/S1 levels (Critical for Intraday).
        *   **Fibonacci Retracements:** Check key levels (0.382, 0.5, 0.618) for pullbacks/reversals.
    *   **Price Action:**
        *   Candlestick Patterns (e.g., Hammer, Engulfing) on ${mode === 'INTRADAY' ? '5-min/15-min' : 'Daily/Weekly'} charts.
        *   Chart Patterns (Flags, Triangles, Head & Shoulders).

3.  **SIGNAL GENERATION:**
    *   Decide: **BUY**, **SELL**, or **NEUTRAL/WAIT**.
    *   **Entry:** Define precise entry range.
    *   **Stop Loss:** MUST be technical (e.g., "Close below 50 EMA" or "2x ATR").
    *   **Targets:** Set multiple targets with min 1:2 Risk-Reward.

### RESPONSE FORMAT:
1.  **Analysis Text (Markdown):** detailed analysis covering the indicators above.
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
  "reasoning": "Bounce off 0.618 Fib + RSI Divergence + Above 20 EMA"
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
        temperature: 0.5, // Balanced for creativity in analysis but precision in data
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4096 }, 
      },
      history: history,
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: `Analyze ${message} for a ${tradingMode} trade setup. Find the latest realtime price.`,
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
        // Remove the JSON block from the display text to avoid duplication
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
