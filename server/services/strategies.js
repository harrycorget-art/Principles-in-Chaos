import { rsi, sma, ema, macd, bollingerBands, monteCarloProjection, annualizedReturn } from './indicators.js'

export const STRATEGIES = {
  hold: {
    key: 'hold',
    label: 'Hold (Do Nothing)',
    color: '#94a3b8',
    targetReturn: 0.08,
    description: 'Maintain all current positions. Review monthly. Trust the original thesis.',
    riskLevel: 'Low',
  },
  conservative: {
    key: 'conservative',
    label: 'Conservative',
    color: '#3b82f6',
    targetReturn: 0.12,
    description: 'Steady growth via diversification, quarterly rebalancing, stop-losses at -15%.',
    riskLevel: 'Low-Medium',
  },
  aggressive: {
    key: 'aggressive',
    label: 'Aggressive',
    color: '#f59e0b',
    targetReturn: 0.28,
    description: 'Momentum-driven. Weekly rebalancing, tight stops, chase breakouts.',
    riskLevel: 'High',
  },
  abstract: {
    key: 'abstract',
    label: 'Out-of-Box Abstract',
    color: '#a855f7',
    targetReturn: 0.35,
    description: 'Contrarian plays, sector rotation, correlation arbitrage, event-driven catalysts.',
    riskLevel: 'High',
  },
  ultra: {
    key: 'ultra',
    label: 'ULTRA AGRO',
    color: '#ef4444',
    targetReturn: 0.65,
    description: '⚡ Maximum aggression. Concentrated positions, leverage, daily swing trades, options.',
    riskLevel: 'EXTREME',
  }
}

function getDailyReturns(history) {
  const closes = history.map(h => h.close)
  const returns = []
  for (let i = 1; i < closes.length; i++) {
    returns.push((closes[i] - closes[i - 1]) / closes[i - 1])
  }
  return returns
}

function getStrategyMultiplier(strategy) {
  return { hold: 1.0, conservative: 1.15, aggressive: 1.35, abstract: 1.45, ultra: 1.8 }[strategy] || 1
}

export function analyzeInvestment(investment, history, quote) {
  const closes = history.map(h => h.close)
  const currentPrice = quote?.price || investment.current_price || investment.buy_price
  const dailyReturns = getDailyReturns(history)

  const rsiVal = rsi(closes)
  const sma50 = sma(closes, 50)
  const sma200 = sma(closes, 200)
  const sma20 = sma(closes, 20)
  const macdData = macd(closes)
  const bb = bollingerBands(closes)
  const currentAnnReturn = annualizedReturn(investment.buy_price, currentPrice, investment.buy_date)
  const totalReturn = (currentPrice - investment.buy_price) / investment.buy_price

  // Project each strategy (252 trading days = ~1 year)
  const projections = {}
  for (const [key, strat] of Object.entries(STRATEGIES)) {
    const mult = getStrategyMultiplier(key)
    const adjustedReturns = dailyReturns.map(r => r * mult)
    const pts = [30, 91, 182, 365].map(days => {
      const proj = monteCarloProjection(currentPrice, adjustedReturns, days, 300)
      return {
        days,
        label: days === 30 ? '1M' : days === 91 ? '3M' : days === 182 ? '6M' : '1Y',
        ...proj
      }
    })
    projections[key] = pts
  }

  // Generate action for each strategy
  const actions = {}
  for (const key of Object.keys(STRATEGIES)) {
    actions[key] = generateAction(key, {
      rsiVal, sma50, sma200, sma20, macdData, bb,
      currentPrice, buyPrice: investment.buy_price, totalReturn, dailyReturns
    }, investment)
  }

  return {
    investment,
    quote,
    currentPrice,
    totalReturn,
    totalReturnPct: totalReturn * 100,
    currentValue: currentPrice * investment.shares,
    costBasis: investment.buy_price * investment.shares,
    pnl: (currentPrice - investment.buy_price) * investment.shares,
    annualizedReturn: currentAnnReturn,
    indicators: { rsi: rsiVal, sma50, sma200, sma20, macd: macdData, bollingerBands: bb },
    projections,
    actions
  }
}

function generateAction(strategy, indicators, investment) {
  const { rsiVal, sma50, sma200, macdData, bb, currentPrice, buyPrice, totalReturn } = indicators

  const goldenCross = sma50 > sma200
  const deathCross = sma50 < sma200
  const oversold = rsiVal < 30
  const overbought = rsiVal > 70
  const macdBullish = macdData.histogram > 0
  const nearUpperBB = currentPrice > bb.upper * 0.97
  const nearLowerBB = currentPrice < bb.lower * 1.03

  if (strategy === 'hold') {
    return {
      action: 'HOLD',
      strength: 'Steady',
      reasoning: `Maintain position. Original thesis: "${investment.reason || 'Long-term hold'}". Review in 30 days.`,
      stopLoss: null,
      takeProfit: null,
    }
  }

  if (strategy === 'conservative') {
    if (totalReturn > 0.30 && overbought) {
      return {
        action: 'TRIM',
        strength: 'Moderate',
        reasoning: `RSI ${rsiVal.toFixed(0)} signals overbought. Up ${(totalReturn * 100).toFixed(1)}%. Trim 20-25% to lock gains.`,
        stopLoss: currentPrice * 0.85,
        takeProfit: currentPrice * 1.10,
      }
    }
    if (deathCross && totalReturn < -0.10) {
      return {
        action: 'REDUCE',
        strength: 'Moderate',
        reasoning: `Death cross (SMA50 < SMA200) with ${(totalReturn * 100).toFixed(1)}% loss. Reduce to 50% position.`,
        stopLoss: currentPrice * 0.88,
        takeProfit: null,
      }
    }
    if (oversold && goldenCross) {
      return {
        action: 'ADD',
        strength: 'Moderate',
        reasoning: `Golden cross with RSI ${rsiVal.toFixed(0)} oversold dip. Add 10-15% to position.`,
        stopLoss: currentPrice * 0.87,
        takeProfit: currentPrice * 1.25,
      }
    }
    return {
      action: 'HOLD',
      strength: 'Steady',
      reasoning: `Trend ${goldenCross ? 'bullish' : 'bearish'}. RSI ${rsiVal.toFixed(0)} neutral. Maintain and review quarterly.`,
      stopLoss: currentPrice * 0.85,
      takeProfit: currentPrice * 1.25,
    }
  }

  if (strategy === 'aggressive') {
    if (rsiVal > 75) {
      return {
        action: 'SELL',
        strength: 'Strong',
        reasoning: `RSI ${rsiVal.toFixed(0)} extremely overbought. Take full profit. Watch for re-entry at RSI < 45.`,
        stopLoss: null,
        takeProfit: currentPrice,
      }
    }
    if (rsiVal < 28 && macdBullish) {
      return {
        action: 'BUY MORE',
        strength: 'Strong',
        reasoning: `RSI ${rsiVal.toFixed(0)} deeply oversold with MACD bullish divergence. Double down — momentum reversal incoming.`,
        stopLoss: currentPrice * 0.92,
        takeProfit: currentPrice * 1.20,
      }
    }
    if (nearUpperBB && !macdBullish) {
      return {
        action: 'TRIM',
        strength: 'Moderate',
        reasoning: `Price at upper Bollinger Band with MACD weakening. Trim 30% of position.`,
        stopLoss: currentPrice * 0.92,
        takeProfit: null,
      }
    }
    if (nearLowerBB && macdBullish) {
      return {
        action: 'BUY MORE',
        strength: 'Moderate',
        reasoning: `Price at lower Bollinger Band with MACD turning bullish. Mean-reversion entry.`,
        stopLoss: currentPrice * 0.92,
        takeProfit: currentPrice * 1.15,
      }
    }
    return {
      action: 'HOLD',
      strength: 'Neutral',
      reasoning: `RSI ${rsiVal.toFixed(0)}. MACD ${macdBullish ? 'bullish' : 'bearish'}. Wait for clearer signal. Stop at -8%.`,
      stopLoss: currentPrice * 0.92,
      takeProfit: currentPrice * 1.20,
    }
  }

  if (strategy === 'abstract') {
    const fearLevel = rsiVal < 35 ? 'FEAR' : rsiVal > 65 ? 'GREED' : 'NEUTRAL'
    if (fearLevel === 'FEAR' && totalReturn < -0.05) {
      return {
        action: 'CONTRARIAN BUY',
        strength: 'High Conviction',
        reasoning: `Market in FEAR (RSI ${rsiVal.toFixed(0)}). Contrarian play: buy when blood is in streets. This is where generational wealth is made.`,
        stopLoss: currentPrice * 0.88,
        takeProfit: currentPrice * 1.40,
      }
    }
    if (fearLevel === 'GREED' && totalReturn > 0.20) {
      return {
        action: 'ROTATE OUT',
        strength: 'High Conviction',
        reasoning: `Market in GREED (RSI ${rsiVal.toFixed(0)}). Rotate profits into uncorrelated assets: commodities, inverse ETFs, or cash.`,
        stopLoss: null,
        takeProfit: currentPrice,
      }
    }
    if (deathCross) {
      return {
        action: 'HEDGE',
        strength: 'Strategic',
        reasoning: `Death cross forming. Buy a small put option position or allocate 15% to inverse ETF as portfolio insurance.`,
        stopLoss: currentPrice * 0.90,
        takeProfit: currentPrice * 1.30,
      }
    }
    return {
      action: 'SECTOR ROTATE',
      strength: 'Moderate',
      reasoning: `No extreme signal. Evaluate sector rotation: shift ${(totalReturn * 100).toFixed(1)}% position gains into leading sector ETF.`,
      stopLoss: currentPrice * 0.88,
      takeProfit: currentPrice * 1.35,
    }
  }

  if (strategy === 'ultra') {
    if (rsiVal < 25) {
      return {
        action: '⚡ MAXIMUM BUY',
        strength: 'EXTREME',
        reasoning: `RSI ${rsiVal.toFixed(0)} — capitulation territory. Load up aggressively. Consider 2x leveraged position. This is the entry of the century.`,
        stopLoss: currentPrice * 0.95,
        takeProfit: currentPrice * 1.30,
      }
    }
    if (rsiVal > 78) {
      return {
        action: '⚡ FULL EXIT + SHORT',
        strength: 'EXTREME',
        reasoning: `RSI ${rsiVal.toFixed(0)} screaming overbought. Exit 100% immediately. Consider shorting or buying puts for maximum alpha.`,
        stopLoss: null,
        takeProfit: currentPrice,
      }
    }
    if (macdBullish && goldenCross && rsiVal < 60) {
      return {
        action: '⚡ LEVERAGE UP',
        strength: 'EXTREME',
        reasoning: `Triple confluence: MACD bullish + Golden Cross + RSI room to run. Use 2-3x leveraged ETF equivalent for maximum upside.`,
        stopLoss: currentPrice * 0.95,
        takeProfit: currentPrice * 1.25,
      }
    }
    if (totalReturn > 0.15) {
      return {
        action: '⚡ COMPOUND PROFITS',
        strength: 'EXTREME',
        reasoning: `Up ${(totalReturn * 100).toFixed(1)}%. Sell half, reinvest profits into highest-momentum position. Compound at all costs.`,
        stopLoss: currentPrice * 0.95,
        takeProfit: currentPrice * 1.20,
      }
    }
    return {
      action: '⚡ SWING TRADE',
      strength: 'EXTREME',
      reasoning: `RSI ${rsiVal.toFixed(0)}. Intraday momentum play. Ride the 5-min chart. Stop -5%, target +8%. Every day is a trade.`,
      stopLoss: currentPrice * 0.95,
      takeProfit: currentPrice * 1.08,
    }
  }

  return { action: 'HOLD', strength: 'Neutral', reasoning: 'No clear signal.', stopLoss: null, takeProfit: null }
}

export function generateWeeklyRegimen(strategy, analyses) {
  const totalValue = analyses.reduce((sum, a) => sum + a.currentValue, 0)
  const bestPerformer = analyses.sort((a, b) => b.totalReturn - a.totalReturn)[0]
  const worstPerformer = [...analyses].sort((a, b) => a.totalReturn - b.totalReturn)[0]

  const regimenMap = {
    hold: [
      { day: 'Monday', task: 'Portfolio Check', detail: `Quick glance at ${analyses.length} positions. Note any major news. No trades needed.`, emoji: '📊' },
      { day: 'Tuesday', task: 'News Scan', detail: 'Check earnings calendar for your holdings. Identify any upcoming catalysts.', emoji: '📰' },
      { day: 'Wednesday', task: 'Thesis Review', detail: `Review why you bought ${bestPerformer?.investment.symbol}. Is the original thesis still valid?`, emoji: '🔍' },
      { day: 'Thursday', task: 'Macro Check', detail: 'Read Fed minutes, CPI data, macro trends. Note anything affecting your holdings.', emoji: '🌍' },
      { day: 'Friday', task: 'Weekly Summary', detail: 'Log weekly performance. No action needed — trust the process.', emoji: '📝' },
      { day: 'Saturday', task: 'Research', detail: 'Study a company in your portfolio or a potential future addition.', emoji: '📚' },
      { day: 'Sunday', task: 'Rest', detail: 'Markets are closed. Recharge. The best trade is often no trade.', emoji: '☀️' },
    ],
    conservative: [
      { day: 'Monday', task: 'Portfolio Review', detail: `Review all ${analyses.length} positions. Flag any that hit stop-loss (-15%) or take-profit (+25%) targets.`, emoji: '📊' },
      { day: 'Tuesday', task: 'Dividend Tracking', detail: 'Check upcoming dividend dates. Consider adding to dividend-paying positions on dips.', emoji: '💰' },
      { day: 'Wednesday', task: 'Rebalance Check', detail: `Current total: $${totalValue.toLocaleString()}. Ensure no single position >20% of portfolio.`, emoji: '⚖️' },
      { day: 'Thursday', task: 'Bond/Stability Check', detail: 'Verify fixed-income allocation. Target 20-30% bonds for stability.', emoji: '🏛️' },
      { day: 'Friday', task: 'Weekly Trade', detail: `If ${worstPerformer?.investment.symbol} is down >15%, trim position. If up >25%, take 20% profit.`, emoji: '📈' },
      { day: 'Saturday', task: 'Research Queue', detail: 'Research one stable, dividend-paying stock for potential addition next week.', emoji: '🔬' },
      { day: 'Sunday', task: 'Plan Monday', detail: 'Write down 3 price levels to watch next week. Set limit orders if desired.', emoji: '📋' },
    ],
    aggressive: [
      { day: 'Monday', task: 'Momentum Scan', detail: `Scan all positions for RSI and MACD signals. Identify the week's top momentum plays.`, emoji: '🚀' },
      { day: 'Tuesday', task: 'Add to Winners', detail: `${bestPerformer?.investment.symbol} leading? Add 5-10% to position if momentum confirmed.`, emoji: '📈' },
      { day: 'Wednesday', task: 'Midweek Review', detail: 'Adjust stops up on profitable positions. Cut any losers that broke support.', emoji: '✂️' },
      { day: 'Thursday', task: 'Earnings Plays', detail: 'Check Thursday/Friday earnings reports. Position for post-earnings momentum moves.', emoji: '📣' },
      { day: 'Friday', task: 'Profit Taking', detail: 'Take profits on 30%+ weekly winners before close. No holding bad positions into weekend.', emoji: '💸' },
      { day: 'Saturday', task: 'Weekend Prep', detail: 'Scan for Monday gap-up candidates. Prepare limit orders for high-conviction entries.', emoji: '⚡' },
      { day: 'Sunday', task: 'Pre-Market Prep', detail: 'Check futures, Asian markets, and news. Have your Monday trade list ready at 9:25 AM.', emoji: '🎯' },
    ],
    abstract: [
      { day: 'Monday', task: 'Macro Rotation Scan', detail: 'Analyze which sectors led/lagged last week. Plan rotation into leading sectors.', emoji: '🔄' },
      { day: 'Tuesday', task: 'Contrarian Opportunity', detail: `Any sector down >10% recently? That's your contrarian setup. Research the reversal case.`, emoji: '↩️' },
      { day: 'Wednesday', task: 'Correlation Analysis', detail: `Check how your ${analyses.length} holdings correlate. If >70% correlated, diversify aggressively.`, emoji: '🕸️' },
      { day: 'Thursday', task: 'Event-Driven Plays', detail: 'Scan for upcoming catalysts: FDA decisions, merger news, regulatory changes, macro data.', emoji: '🎲' },
      { day: 'Friday', task: 'VIX & Sentiment', detail: 'Check VIX (fear index). If >25, buy quality. If <15, hedge. Sell the crowd\'s narrative.', emoji: '😱' },
      { day: 'Saturday', task: 'Unconventional Research', detail: 'Read about adjacent industries to your holdings. Find non-obvious connections.', emoji: '🌀' },
      { day: 'Sunday', task: 'Thesis Building', detail: 'Write a 3-sentence contrarian thesis for next week\'s abstract play.', emoji: '📜' },
    ],
    ultra: [
      { day: 'Monday', task: '⚡ FULL OFFENSE', detail: 'Pre-market at 8:00 AM. Execute your highest-conviction trade at open. No hesitation.', emoji: '💥' },
      { day: 'Tuesday', task: '⚡ COMPOUND', detail: `If Monday trade profitable: compound profits immediately into next highest-momentum play.`, emoji: '⚡' },
      { day: 'Wednesday', task: '⚡ MIDWEEK PURGE', detail: 'Cut ALL losers at -5%. Zero mercy. Capital must move to winners only. No bagholding.', emoji: '🔥' },
      { day: 'Thursday', task: '⚡ LEVERAGE REVIEW', detail: 'Review leveraged positions. If conviction still max, hold. If not, exit and preserve capital.', emoji: '⚡' },
      { day: 'Friday', task: '⚡ CLOSE SHORTS', detail: 'Close all short-term trades before 3:45 PM. Lock in the week. Rebuild powder for Monday.', emoji: '💰' },
      { day: 'Saturday', task: '⚡ WEEKEND WAR ROOM', detail: 'Study charts for 2 hours. Identify Monday setups. Write your top 3 trade plans with entries/exits.', emoji: '🎯' },
      { day: 'Sunday', task: '⚡ GAME DAY PREP', detail: 'Pre-market watchlist ready. Orders queued. Position sizing calculated. You are the market.', emoji: '👁️' },
    ]
  }

  return regimenMap[strategy] || regimenMap.hold
}

export function generateDailyRecommendation(strategy, analyses) {
  if (!analyses || analyses.length === 0) {
    return {
      action: 'HOLD',
      symbol: 'N/A',
      reasoning: 'Add investments to your portfolio to receive daily recommendations.',
      confidence: 0,
    }
  }

  // Find the best opportunity based on strategy
  let bestOpportunity = null
  let bestScore = -Infinity

  for (const analysis of analyses) {
    const action = analysis.actions[strategy]
    if (!action) continue

    let score = 0
    const r = analysis.indicators.rsi

    if (strategy === 'ultra') {
      if (r < 25) score = 100
      else if (r > 78) score = 90
      else if (action.action.includes('LEVERAGE')) score = 80
      else score = Math.abs(50 - r)
    } else if (strategy === 'aggressive') {
      if (action.action === 'SELL') score = 90
      else if (action.action === 'BUY MORE') score = 85
      else score = Math.abs(50 - r)
    } else if (strategy === 'abstract') {
      if (action.action.includes('CONTRARIAN')) score = 95
      else if (action.action.includes('HEDGE')) score = 80
      else score = 50
    } else if (strategy === 'conservative') {
      if (action.action === 'TRIM' || action.action === 'ADD') score = 80
      else score = 30
    } else {
      score = 10 // hold strategy - no urgency
    }

    if (score > bestScore) {
      bestScore = score
      bestOpportunity = { analysis, action }
    }
  }

  if (!bestOpportunity) {
    return { action: 'HOLD', symbol: 'Portfolio', reasoning: 'No strong signals today. Hold all positions.', confidence: 30 }
  }

  const { analysis, action } = bestOpportunity
  const confidence = Math.min(95, Math.round(bestScore * 0.9 + 10))

  return {
    action: action.action,
    symbol: analysis.investment.symbol,
    shares: analysis.investment.shares,
    currentPrice: analysis.currentPrice,
    targetPrice: action.takeProfit,
    stopLoss: action.stopLoss,
    reasoning: action.reasoning,
    confidence,
    strength: action.strength,
    pnl: analysis.pnl,
    totalReturnPct: analysis.totalReturnPct,
  }
}
