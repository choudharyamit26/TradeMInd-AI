
# TradeMind AI

TradeMind AI is an AI-powered swing trading assistant for the Indian stock market. It utilizes the Gemini 3 Pro model with real-time Google Search grounding to analyze stock technicals and generate trading signals.

## Features

- **Gemini 3 Pro Integration:** Uses the latest Gemini models for deep reasoning.
- **Real-time Market Data:** Fetches live stock info via Google Search grounding.
- **Advanced Technical Analysis:**
  - **Indicators:** EMA (9/20/50/200), RSI, MACD, ADX, Bollinger Bands, ATR.
  - **Structure:** Pivot Points, Fibonacci Retracements.
  - **Patterns:** Candlestick & Chart Patterns.
- **Dual Mode:** Specialized analysis for **Intraday** and **Swing** trading.
- **Watchlist:** Save and monitor your favorite stocks.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- An API Key for Google Gemini (get it from [Google AI Studio](https://aistudio.google.com/))
- [Git](https://git-scm.com/) installed on your machine.

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

## Pushing to GitHub

To host this code on GitHub, follow these steps:

1.  **Initialize Git:**
    Inside your project folder, run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: TradeMind AI App"
    ```

2.  **Create a Repository:**
    Go to [GitHub.com/new](https://github.com/new) and create a new empty repository.

3.  **Push to GitHub:**
    Copy the commands provided by GitHub (under "…or push an existing repository from the command line") and run them. They will look like this:

    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

4.  **Deploy (Optional):**
    You can deploy this app easily to Vercel or Netlify by connecting your new GitHub repository to their platform. Remember to add your `API_KEY` in the deployment platform's Environment Variables settings.
