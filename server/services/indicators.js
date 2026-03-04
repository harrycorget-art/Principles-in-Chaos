// Technical indicator calculations

export function sma(prices, period) {
  if (prices.length < period) return prices.at(-1) ?? 0
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period
}

export function ema(prices, period) {
  if (prices.length === 0) return 0
  const k = 2 / (period + 1)
  let result = prices[0]
  for (let i = 1; i < prices.length; i++) {
    result = prices[i] * k + result * (1 - k)
  }
  return result
}

export function rsi(prices, period = 14) {
  if (prices.length < period + 1) return 50
  const changes = prices.slice(1).map((p, i) => p - prices[i])
  let avgGain = 0, avgLoss = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i]
    else avgLoss += Math.abs(changes[i])
  }
  avgGain /= period
  avgLoss /= period

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export function macd(prices, fast = 12, slow = 26, signal = 9) {
  if (prices.length < slow) return { macd: 0, signal: 0, histogram: 0 }
  const emaFast = ema(prices, fast)
  const emaSlow = ema(prices, slow)
  const macdLine = emaFast - emaSlow

  // Compute signal line from rolling MACD values
  const macdValues = []
  for (let i = slow - 1; i < prices.length; i++) {
    const f = ema(prices.slice(0, i + 1), fast)
    const s = ema(prices.slice(0, i + 1), slow)
    macdValues.push(f - s)
  }
  const signalLine = ema(macdValues, signal)
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  }
}

export function bollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return { upper: 0, middle: 0, lower: 0 }
  const slice = prices.slice(-period)
  const middle = slice.reduce((a, b) => a + b, 0) / period
  const variance = slice.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / period
  const std = Math.sqrt(variance)
  return { upper: middle + stdDev * std, middle, lower: middle - stdDev * std }
}

// Gaussian random via Box-Muller
function randNormal() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export function monteCarloProjection(currentPrice, dailyReturns, days = 252, sims = 500) {
  if (dailyReturns.length < 5) {
    return { pessimistic: currentPrice, expected: currentPrice, optimistic: currentPrice }
  }
  const mu = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / dailyReturns.length
  const sigma = Math.sqrt(variance)

  const finals = []
  for (let s = 0; s < sims; s++) {
    let price = currentPrice
    for (let d = 0; d < days; d++) {
      price *= 1 + (mu + sigma * randNormal())
    }
    finals.push(price)
  }
  finals.sort((a, b) => a - b)
  return {
    pessimistic: finals[Math.floor(sims * 0.1)],
    expected: finals[Math.floor(sims * 0.5)],
    optimistic: finals[Math.floor(sims * 0.9)]
  }
}

export function annualizedReturn(buyPrice, currentPrice, buyDate) {
  const years = (Date.now() - new Date(buyDate).getTime()) / (365.25 * 24 * 3600 * 1000)
  if (years < 0.01) return 0
  return Math.pow(currentPrice / buyPrice, 1 / years) - 1
}
