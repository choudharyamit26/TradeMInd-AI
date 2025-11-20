import { GoogleGenAI, GenerateContentResponse, Tool } from "@google/genai";

// Initialize the client
// Note: In a real production app, you might want to handle the API key more securely or prompt for it if missing.
// For this demo, we assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

const SYSTEM_INSTRUCTION = `
You are an expert Technical Analyst and Swing Trader specializing in the Indian Stock Market (NSE/BSE).
Your goal is to provide actionable swing trading insights based on real-time data found via Google Search.

When a user asks about a stock:
1.  **Search** for the latest price, volume, and recent news.
2.  **Search** for specific technical indicators: RSI, MACD, Moving Averages (20, 50, 200 DMA), and Bollinger Bands.
3.  **Identify** any candlestick patterns (e.g., Doji, Hammer, Engulfing) or chart patterns (e.g., Head & Shoulders, Flag, Cup & Handle) mentioned in recent trusted financial analysis (MoneyControl, TradingView, Economic Times, etc.).
4.  **Analyze** the trend on different timeframes (Daily for swing, Weekly for trend confirmation).

**Output Structure:**
*   **Snapshot:** Current Price & Trend (Bullish/Bearish/Neutral).
*   **Technical Analysis:** Key indicators and patterns found.
*   **Signal:** BUY, SELL, or WAIT.
*   **Trade Setup:**
    *   Entry Price Range
    *   Stop Loss (Strict)
    *   Target 1 & Target 2
*   **Rationale:** Brief explanation of why this setup is valid.

Disclaimer: Always end with a standard disclaimer that this is for educational purposes and not financial advice.
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<{ text: string; sources?: { title: string; uri: string }[] }> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balanced creativity and precision
        // Enable Google Search for real-time stock data
        tools: [{ googleSearch: {} }],
        // Enable thinking for complex reasoning about chart patterns
        thinkingConfig: { thinkingBudget: 2048 }, 
      },
      history: history,
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: message,
    });

    const text = result.text || "I couldn't generate a response. Please try again.";
    
    // Extract grounding chunks (sources) if available
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk) => chunk.web)
      .filter((web) => web !== undefined && web !== null) as { title: string; uri: string }[] | undefined;

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};