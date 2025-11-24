
import { BacktestConfig, BacktestResult, FullBacktestReport, Trade, BacktestMetrics, OptimizationParam, MonteCarloStats } from "../types";

// Helper: Generate Gaussian Random for realistic price movement
const boxMullerRandom = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
};

// 1. DATA SIMULATION (Mimicking yfinance structure)
const generateHistoricalData = (symbol: string, days: number, startPrice: number, startDateStr?: string) => {
    const data = [];
    let currentPrice = startPrice;
    const volatility = 0.02; // 2% daily volatility
    
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    if (!startDateStr) startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const changePercent = boxMullerRandom() * volatility;
        const open = currentPrice;
        const close = currentPrice * (1 + changePercent);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        
        data.push({
            date: date.toISOString().split('T')[0],
            open, high, low, close,
            volume: Math.floor(Math.random() * 1000000) + 50000
        });
        currentPrice = close;
    }
    return data;
};

// 2. CORE STRATEGY EXECUTOR
const executeStrategy = (prices: any[], initialCapital: number, strategyType: string): BacktestResult => {
    const trades: Trade[] = [];
    let cash = initialCapital;
    let equityCurve = [];
    let position: { entryPrice: number; qty: number; date: string; type: 'LONG' | 'SHORT' } | null = null;

    // Simulate simple Moving Average Crossover logic based on Strategy Type
    // NOTE: In a production app, we would parse the `strategyId` rules using a DSL parser.
    // For this simulation, we use a robust trend-following logic as a proxy.
    const shortPeriod = 9;
    const longPeriod = 21;

    // Fill initial days where indicators can't be calculated
    for(let i=0; i<longPeriod; i++) {
        equityCurve.push(initialCapital);
    }

    for (let i = longPeriod; i < prices.length; i++) {
        const currentPrice = prices[i].close;
        const date = prices[i].date;

        // Calculate simple mock indicators
        const smaShort = prices.slice(i - shortPeriod, i).reduce((a:any, b:any) => a + b.close, 0) / shortPeriod;
        const smaLong = prices.slice(i - longPeriod, i).reduce((a:any, b:any) => a + b.close, 0) / longPeriod;
        const prevSmaShort = prices.slice(i - shortPeriod - 1, i - 1).reduce((a:any, b:any) => a + b.close, 0) / shortPeriod;
        const prevSmaLong = prices.slice(i - longPeriod - 1, i - 1).reduce((a:any, b:any) => a + b.close, 0) / longPeriod;
        
        // Trading Logic
        if (!position) {
            // ENTRY CONDITIONS (Golden Cross)
            if (prevSmaShort < prevSmaLong && smaShort > smaLong) { 
                const qty = Math.floor((cash * 0.95) / currentPrice); // Use 95% of cash
                if (qty > 0) {
                    position = { entryPrice: currentPrice, qty, date, type: 'LONG' };
                    cash -= qty * currentPrice;
                }
            }
        } else {
            // EXIT CONDITIONS
            const pnl = (currentPrice - position.entryPrice) * position.qty;
            const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;
            
            // Take Profit (8%) or Stop Loss (-3%) or Cross Under
            if (pnlPercent > 0.08 || pnlPercent < -0.03 || smaShort < smaLong) {
                let exitReason = "Indicator Reversal";
                if (pnlPercent > 0.08) exitReason = "Take Profit Hit (+8%)";
                if (pnlPercent < -0.03) exitReason = "Stop Loss Hit (-3%)";
                
                trades.push({
                    id: Math.random().toString(36).substr(2, 9),
                    symbol: "MOCK", // updated later
                    direction: position.type,
                    entryDate: position.date,
                    exitDate: date,
                    entryPrice: parseFloat(position.entryPrice.toFixed(2)),
                    exitPrice: parseFloat(currentPrice.toFixed(2)),
                    quantity: position.qty,
                    pnl: parseFloat(pnl.toFixed(2)),
                    pnlPercent: parseFloat((pnlPercent * 100).toFixed(2)),
                    entryReason: "SMA Golden Cross",
                    exitReason: exitReason,
                    status: pnl > 0 ? 'WIN' : 'LOSS'
                });

                cash += position.qty * currentPrice;
                position = null;
            }
        }
        
        // Update Equity
        const currentEquity = cash + (position ? position.qty * currentPrice : 0);
        equityCurve.push(parseFloat(currentEquity.toFixed(2)));
    }

    return {
        stock: "", // Filled later
        equityCurve,
        trades,
        metrics: calculateMetrics(trades, initialCapital, equityCurve)
    };
};

const calculateMetrics = (trades: Trade[], startCap: number, equityCurve: number[]): BacktestMetrics => {
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    const totalPnl = equityCurve[equityCurve.length - 1] - startCap;
    
    // Max Drawdown calc
    let peak = -Infinity;
    let maxDrawdown = 0;
    for (const val of equityCurve) {
        if (val > peak) peak = val;
        const dd = (peak - val) / peak;
        if (dd > maxDrawdown) maxDrawdown = dd;
    }

    return {
        totalTrades: trades.length,
        winRate: parseFloat(((wins.length / (trades.length || 1)) * 100).toFixed(1)),
        netProfit: parseFloat(totalPnl.toFixed(2)),
        profitFactor: Math.abs(wins.reduce((a,b) => a+b.pnl, 0) / (losses.reduce((a,b) => a+b.pnl, 0) || 1)),
        maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(1)),
        avgWin: parseFloat((wins.reduce((a,b)=>a+b.pnl,0) / (wins.length||1)).toFixed(2)),
        avgLoss: parseFloat((losses.reduce((a,b)=>a+b.pnl,0) / (losses.length||1)).toFixed(2)),
        expectancy: parseFloat((totalPnl / (trades.length || 1)).toFixed(2))
    };
};

// 3. MAIN RUNNER
export const runBacktestSimulation = async (config: BacktestConfig): Promise<FullBacktestReport> => {
    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const stockResults: Record<string, BacktestResult> = {};
    let aggregatedTrades: Trade[] = [];
    
    // Calculate duration from dates
    const start = new Date(config.startDate || '2023-01-01');
    const end = new Date(config.endDate || '2023-12-31');
    const days = Math.max(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

    // Determine allocation per stock
    const allocation = config.initialCapital / (config.stocks.length || 1);

    // Standard Backtest Loop
    for (const stock of config.stocks) {
        // Generate Mock OHLC based on requested days
        const prices = generateHistoricalData(stock, days, Math.random() * 1000 + 100, config.startDate);
        
        // Run Engine
        const result = executeStrategy(prices, allocation, config.tradingType);
        result.stock = stock;
        result.trades.forEach(t => t.symbol = stock);
        
        stockResults[stock] = result;
        aggregatedTrades = [...aggregatedTrades, ...result.trades];
    }

    // Sort trades by date
    aggregatedTrades.sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());

    // Construct Composite Equity Curve
    const combinedEquity = [];
    
    // Calculate simulated length of equity curve (approx same as input days, minus indicator warm up)
    // We find the max length returned by any stock
    const maxLen = Math.max(...Object.values(stockResults).map(r => r.equityCurve.length));

    for(let i=0; i<maxLen; i++) {
        let dayTotal = 0;
        let activeStocks = 0;
        for(const stock in stockResults) {
            const curve = stockResults[stock].equityCurve;
            if (i < curve.length) {
                dayTotal += curve[i];
            } else if (curve.length > 0) {
                // If this stock's curve ended early (shouldn't happen in sim), hold last value
                dayTotal += curve[curve.length - 1];
            }
            activeStocks++;
        }
        // If no stocks, baseline is capital
        if (activeStocks === 0) dayTotal = config.initialCapital;
        combinedEquity.push(dayTotal);
    }

    const overallMetrics = calculateMetrics(aggregatedTrades, config.initialCapital, combinedEquity);

    // --- MODE SPECIFIC LOGIC ---
    
    let optimizationResults: OptimizationParam[] = [];
    if (config.mode === 'OPTIMIZATION') {
        optimizationResults = [
            { paramName: 'EMA 9/21 (Standard)', value: 'Baseline', netProfit: overallMetrics.netProfit, winRate: overallMetrics.winRate },
            { paramName: 'EMA 20/50 (Trend)', value: 'Conservative', netProfit: overallMetrics.netProfit * 0.85, winRate: overallMetrics.winRate + 7 },
            { paramName: 'EMA 5/13 (Scalp)', value: 'Aggressive', netProfit: overallMetrics.netProfit * 1.3, winRate: overallMetrics.winRate - 12 },
            { paramName: 'RSI 14 Period', value: 'Overbought/Sold', netProfit: overallMetrics.netProfit * 0.95, winRate: overallMetrics.winRate + 2 },
        ];
    }

    let monteCarloResults: MonteCarloStats | undefined;
    if (config.mode === 'MONTE_CARLO' && config.mcSimulations) {
        const pnls = aggregatedTrades.map(t => t.pnlPercent);
        const simulations = [];
        for(let i=0; i<config.mcSimulations; i++) {
            // Shuffle
            const shuffled = pnls.sort(() => Math.random() - 0.5);
            const totalReturn = shuffled.reduce((a, b) => a + b, 0);
            simulations.push(totalReturn);
        }
        simulations.sort((a,b) => a-b);
        monteCarloResults = {
            simulationCount: config.mcSimulations,
            worstCaseReturn: parseFloat(simulations[0].toFixed(2)),
            bestCaseReturn: parseFloat(simulations[simulations.length-1].toFixed(2)),
            avgReturn: parseFloat((simulations.reduce((a,b)=>a+b,0)/simulations.length).toFixed(2)),
            confidence95: parseFloat(simulations[Math.floor(simulations.length * 0.05)].toFixed(2))
        };
    }

    let walkForwardResults;
    if (config.mode === 'WALK_FORWARD') {
        // Mock WF results by applying degradation factor
        const wfFactor = 0.75; // Out of sample performance usually drops
        walkForwardResults = {
            inSampleMetrics: { ...overallMetrics, netProfit: overallMetrics.netProfit * 1.1 },
            outSampleMetrics: { ...overallMetrics, netProfit: overallMetrics.netProfit * wfFactor } 
        };
    }

    return {
        overallMetrics,
        stockResults,
        equityCurve: combinedEquity,
        optimizationResults,
        monteCarloResults,
        walkForwardResults
    };
};
