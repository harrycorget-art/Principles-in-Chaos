import express from 'express'
import db from '../db.js'
import { getQuote } from '../services/marketData.js'

const router = express.Router()

// GET all investments
router.get('/', (req, res) => {
  const investments = db.prepare('SELECT * FROM investments ORDER BY created_at DESC').all()
  res.json(investments)
})

// GET single investment
router.get('/:id', (req, res) => {
  const inv = db.prepare('SELECT * FROM investments WHERE id = ?').get(req.params.id)
  if (!inv) return res.status(404).json({ error: 'Not found' })
  res.json(inv)
})

// POST add investment
router.post('/', async (req, res) => {
  const { symbol, type, name, shares, buy_price, buy_date, reason } = req.body
  if (!symbol || !type || !shares || !buy_price || !buy_date) {
    return res.status(400).json({ error: 'Missing required fields: symbol, type, shares, buy_price, buy_date' })
  }

  // Fetch current price
  const quote = await getQuote(symbol, type)
  const currentPrice = quote?.price || null

  const result = db.prepare(`
    INSERT INTO investments (symbol, type, name, shares, buy_price, buy_date, reason, current_price, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(symbol.toUpperCase(), type, name || quote?.name || symbol.toUpperCase(), shares, buy_price, buy_date, reason || '', currentPrice)

  const newInv = db.prepare('SELECT * FROM investments WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newInv)
})

// PUT update investment
router.put('/:id', (req, res) => {
  const { symbol, type, name, shares, buy_price, buy_date, reason } = req.body
  const existing = db.prepare('SELECT * FROM investments WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })

  db.prepare(`
    UPDATE investments
    SET symbol = ?, type = ?, name = ?, shares = ?, buy_price = ?, buy_date = ?, reason = ?
    WHERE id = ?
  `).run(
    symbol || existing.symbol,
    type || existing.type,
    name || existing.name,
    shares ?? existing.shares,
    buy_price ?? existing.buy_price,
    buy_date || existing.buy_date,
    reason ?? existing.reason,
    req.params.id
  )

  res.json(db.prepare('SELECT * FROM investments WHERE id = ?').get(req.params.id))
})

// DELETE investment
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM investments WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  db.prepare('DELETE FROM investments WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// GET settings
router.get('/meta/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get()
  res.json(settings)
})

// PUT update settings
router.put('/meta/settings', (req, res) => {
  const { target_strategy, risk_tolerance, target_return, time_horizon } = req.body
  db.prepare(`
    UPDATE settings SET target_strategy = ?, risk_tolerance = ?, target_return = ?, time_horizon = ?
    WHERE id = 1
  `).run(target_strategy, risk_tolerance, target_return, time_horizon)
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get())
})

export default router
