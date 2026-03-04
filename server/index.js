import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import cron from 'node-cron'
import { mkdirSync } from 'fs'

import portfolioRoutes from './routes/portfolio.js'
import analysisRoutes from './routes/analysis.js'
import db from './db.js'
import { getMultipleQuotes, isMarketOpen } from './services/marketData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ensure data directory exists
mkdirSync(path.join(__dirname, '../data'), { recursive: true })

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/analysis', analysisRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', marketOpen: isMarketOpen(), timestamp: new Date().toISOString() })
})

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

// Real-time price push via Socket.io
async function broadcastPriceUpdates() {
  const investments = db.prepare('SELECT * FROM investments').all()
  if (investments.length === 0) return

  const quotes = await getMultipleQuotes(investments)
  const updates = quotes.filter(q => q.quote !== null)

  // Update DB with latest prices
  for (const update of updates) {
    if (update.quote?.price) {
      db.prepare(`UPDATE investments SET current_price = ?, last_updated = datetime('now') WHERE id = ?`)
        .run(update.quote.price, update.id)
    }
  }

  io.emit('priceUpdate', { quotes: updates, timestamp: new Date().toISOString(), marketOpen: isMarketOpen() })
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Send immediate update on connect
  broadcastPriceUpdates()

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })

  socket.on('requestUpdate', () => {
    broadcastPriceUpdates()
  })
})

// Schedule price updates: every 30s during market hours, every 5min otherwise
cron.schedule('*/30 * * * * *', async () => {
  if (isMarketOpen()) {
    await broadcastPriceUpdates()
  }
})

cron.schedule('*/5 * * * *', async () => {
  if (!isMarketOpen()) {
    await broadcastPriceUpdates()
  }
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Principles-in-Chaos Server running on http://localhost:${PORT}`)
  console.log(`📊 Market ${isMarketOpen() ? 'OPEN 🟢' : 'CLOSED 🔴'}`)
  console.log(`📡 Real-time updates via Socket.io\n`)
})
