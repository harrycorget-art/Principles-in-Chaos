// Market Data Service
// Attempts real Yahoo Finance fetches; falls back to realistic simulated data

const cache = new Map()

function getCached(key) {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expires) return entry.data
  return null
}
function setCache(key, data, ttlMs) {
  cache.set(key, { data, expires: Date.now() + ttlMs })
}

function normalizeSymbol(symbol, type) {
  const s = symbol.toUpperCase().trim()
  if (type === 'crypto' && !s.includes('-')) return `${s}-USD`
  return s
}

// Seeded pseudo-random (deterministic per symbol so demo data is consistent)
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function symbolSeed(symbol) {
  return symbol.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0
}

// Typical annualized volatility and drift by asset class
const CLASS_PARAMS = {
  stock:  { vol: 0.22, drift: 0.12 },
  mutual: { vol: 0.14, drift: 0.10 },
  bond:   { vol: 0.06, drift: 0.04 },
  crypto: { vol: 0.65, drift: 0.25 },
}

function generateHistory(symbol, type, buyPrice, buyDate, days = 365) {
  const rand = seededRandom(symbolSeed(symbol))
  const { vol, drift } = CLASS_PARAMS[type] || CLASS_PARAMS.stock

  const dailyVol = vol / Math.sqrt(252)
  const dailyDrift = drift / 252

  const history = []
  const now = Date.now()
  const startMs = now - days * 86400000
  const buyMs = new Date(buyDate).getTime()

  // Anchor price so it reaches buyPrice on the buy date naturally
  const daysBeforeBuy = Math.max(0, Math.floor((buyMs - startMs) / 86400000))
  let price = buyPrice * Math.exp(-daysBeforeBuy * dailyDrift)

  for (let d = 0; d < days; d++) {
    const dateMs = startMs + d * 86400000
    const date = new Date(dateMs)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const z = (rand() + rand() + rand() - 1.5) * 1.2 // approximate normal
    price = price * Math.exp(dailyDrift + dailyVol * z)
    price = Math.max(price, 0.01)

    history.push({
      date: date.toISOString().split('T')[0],
      open: +(price * (0.99 + rand() * 0.02)).toFixed(4),
      high: +(price * (1.00 + rand() * 0.03)).toFixed(4),
      low:  +(price * (0.97 + rand() * 0.02)).toFixed(4),
      close: +price.toFixed(4),
      volume: Math.floor(rand() * 5000000 + 500000),
    })
  }

  return history
}

function generateQuote(symbol, type, buyPrice, buyDate) {
  const history = generateHistory(symbol, type, buyPrice, buyDate, 365)
  const last = history[history.length - 1]
  const prev = history[history.length - 2] || last
  const price = last?.close || buyPrice
  const prevClose = prev?.close || buyPrice

  return {
    symbol,
    name: symbol,
    price,
    previousClose: prevClose,
    change: price - prevClose,
    changePct: ((price - prevClose) / prevClose) * 100,
    high52: Math.max(...history.map(h => h.high)),
    low52: Math.min(...history.map(h => h.low)),
    marketState: isMarketOpen() ? 'REGULAR' : 'CLOSED',
    volume: last?.volume || 1000000,
    simulated: true,
  }
}

async function tryFetchQuote(symbol) {
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5000)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    })
    if (!res.ok) return null
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null
    const meta = result.meta
    return {
      symbol: meta.symbol,
      name: meta.longName || meta.shortName || meta.symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose || meta.chartPreviousClose,
      change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
      changePct: ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose)) * 100,
      high52: meta.fiftyTwoWeekHigh,
      low52: meta.fiftyTwoWeekLow,
      marketState: meta.marketState,
      volume: meta.regularMarketVolume,
      simulated: false,
    }
  } catch {
    return null
  }
}

async function tryFetchHistory(symbol) {
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 8000)
    const to = Math.floor(Date.now() / 1000)
    const from = to - 365 * 86400
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${from}&period2=${to}`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null
    const timestamps = result.timestamp || []
    const q = result.indicators?.quote?.[0] || {}
    return timestamps.map((t, i) => ({
      date: new Date(t * 1000).toISOString().split('T')[0],
      open: q.open?.[i], high: q.high?.[i], low: q.low?.[i],
      close: q.close?.[i], volume: q.volume?.[i]
    })).filter(d => d.close != null)
  } catch {
    return null
  }
}

export async function getQuote(symbol, type = 'stock', buyPrice = 100, buyDate = '2024-01-01') {
  const sym = normalizeSymbol(symbol, type)
  const cacheKey = `quote:${sym}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  let data = await tryFetchQuote(sym)
  if (!data) data = generateQuote(sym, type, buyPrice, buyDate)

  setCache(cacheKey, data, 60_000)
  return data
}

export async function getHistory(symbol, type = 'stock', period = '1y', buyPrice = 100, buyDate = '2024-01-01') {
  const sym = normalizeSymbol(symbol, type)
  const cacheKey = `history:${sym}:${period}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  let data = await tryFetchHistory(sym)
  if (!data || data.length < 10) data = generateHistory(sym, type, buyPrice, buyDate, 365)

  setCache(cacheKey, data, 3_600_000)
  return data
}

export async function getMultipleQuotes(investments) {
  const results = await Promise.allSettled(
    investments.map(inv => getQuote(inv.symbol, inv.type, inv.buy_price, inv.buy_date))
  )
  return results.map((r, i) => ({
    id: investments[i].id,
    symbol: investments[i].symbol,
    quote: r.status === 'fulfilled' ? r.value : null
  }))
}

export function isMarketOpen() {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay()
  const hour = et.getHours()
  const minute = et.getMinutes()
  const time = hour * 60 + minute
  return day >= 1 && day <= 5 && time >= 570 && time < 960
}
