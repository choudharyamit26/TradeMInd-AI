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
    *   **Search Query:** Perform a specific search for "[Stock Symbol] news India last 2 weeks".
    *   **Events:** Look for Earnings reports, Board meetings, Order wins, Government policy changes, or Global cues affecting the sector.
    *   **Sentiment:** Determine if the recent news flow is **Positive**, **Negative**, or **Neutral**.
    *   **Impact:** Adjust your Buy/Sell decision based on this news. *Do not ignore bad news even if technicals are good.*

3.  **ADVANCED TECHNICAL ANALYSIS (REQUIRED):**
    *   **Trend:** EMA (9, 21, 50, 200), ADX (>25?).
    *   **Momentum:** RSI, MACD Divergences.
    *   **Volatility:** Bollinger Bands, ATR.
    *   **Structure:** Pivot Points, Fibonacci, Patterns (Head & Shoulders, Flags).
    *   **Timeframe:** ${mode === 'INTRADAY' ? '5-min / 15-min' : 'Daily / Weekly'}.

4.  **SIGNAL GENERATION:**
    *   Decide: **BUY**, **SELL**, or **NEUTRAL/WAIT**.
    *   **Entry:** Precise range.
    *   **Stop Loss:** Technical level (Swing low / EMA).
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
  "reasoning": "Technicals: Breakout above 50 EMA. Fundamentals: Positive news regarding retail arm expansion.",
  "newsSummary": "Reliance Retail secured massive funding; Oil refining margins improved in last 2 weeks.",
  "newsSentiment": "Positive"
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
        temperature: 0.4, // Slightly lower to keep news analysis grounded in fact
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4096 }, 
      },
      history: history,
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: `Analyze ${message} for a ${tradingMode} trade. 1. Find real-time price. 2. Search for MAJOR news in last 14 days and factor it into the decision.`,
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