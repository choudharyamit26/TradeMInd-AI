# TradeMind AI

TradeMind AI is an AI-powered swing trading assistant for the Indian stock market. It utilizes the Gemini 3 Pro model with real-time Google Search grounding to analyze stock technicals and generate trading signals.

## Features

- **Gemini 3 Pro Integration:** Uses the latest Gemini models for deep reasoning.
- **Real-time Market Data:** Fetches live stock info via Google Search grounding.
- **Technical Analysis:** Analyzes candlesticks, chart patterns, RSI, MACD, and moving averages.
- **Swing Trade Signals:** Generates Buy/Sell/Wait signals with entry, stop-loss, and target levels.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- An API Key for Google Gemini (get it from [Google AI Studio](https://aistudio.google.com/))

## Installation

1.  **Download the code** to your local machine.
2.  Open a terminal in the project root directory.
3.  Install dependencies:

    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root directory.
2.  Add your Google Gemini API key:

    ```env
    API_KEY=your_actual_api_key_here
    ```

## Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Build for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` directory.
