import express from 'express'
import db from '../db.js'
import { getQuote, getHistory } from '../services/marketData.js'
import { analyzeInvestment, generateWeeklyRegimen, generateDailyRecommendation, STRATEGIES } from '../services/strategies.js'

const router = express.Router()

// GET full analysis for all investments
router.get('/', async (req, res) => {
  const investments = db.prepare('SELECT * FROM investments').all()
  if (investments.length === 0) return res.json({ analyses: [], strategies: STRATEGIES })

  const analyses = await Promise.all(investments.map(async inv => {
    const [quote, history] = await Promise.all([
      getQuote(inv.symbol, inv.type, inv.buy_price, inv.buy_date),
      getHistory(inv.symbol, inv.type, '1y', inv.buy_price, inv.buy_date)
    ])
    return analyzeInvestment(inv, history, quote)
  }))

  const valid = analyses.filter(a => a && a.currentPrice)

  const totalValue = valid.reduce((sum, a) => sum + a.currentValue, 0)
  const totalCost = valid.reduce((sum, a) => sum + a.costBasis, 0)
  const totalPnl = valid.reduce((sum, a) => sum + a.pnl, 0)

  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get()
  const targetStrategy = settings?.target_strategy || 'aggressive'

  return res.json({
    analyses: valid,
    portfolio: {
      totalValue,
      totalCost,
      totalPnl,
      totalReturnPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    },
    strategies: STRATEGIES,
    targetStrategy,
    dailyRecommendation: generateDailyRecommendation(targetStrategy, valid),
    weeklyRegimen: generateWeeklyRegimen(targetStrategy, valid),
  })
})

// GET analysis for a single strategy
router.get('/strategy/:key', async (req, res) => {
  const { key } = req.params
  if (!STRATEGIES[key]) return res.status(400).json({ error: 'Unknown strategy' })

  const investments = db.prepare('SELECT * FROM investments').all()
  const analyses = await Promise.all(investments.map(async inv => {
    const [quote, history] = await Promise.all([
      getQuote(inv.symbol, inv.type, inv.buy_price, inv.buy_date),
      getHistory(inv.symbol, inv.type, '1y', inv.buy_price, inv.buy_date)
    ])
    return analyzeInvestment(inv, history, quote)
  }))

  const valid = analyses.filter(a => a && a.currentPrice)

  res.json({
    strategy: STRATEGIES[key],
    analyses: valid,
    recommendation: generateDailyRecommendation(key, valid),
    weeklyRegimen: generateWeeklyRegimen(key, valid),
  })
})

// GET price history for chart
router.get('/history/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { type = 'stock', period = '1y', buyPrice = '100', buyDate = '2024-01-01' } = req.query
  const history = await getHistory(symbol, type, period, parseFloat(buyPrice), buyDate)
  res.json(history)
})

// GET strategies metadata
router.get('/strategies', (req, res) => {
  res.json(STRATEGIES)
})

export default router
