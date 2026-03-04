# ⚡ Principles in Chaos — Investment Terminal

A full-stack investment habit builder and strategy analyzer with real-time market data.

## Features

- **Portfolio Tracking** — Add stocks, mutual funds, bonds, and crypto with buy date & thesis
- **5-Strategy Analysis** — See how each strategy performs across your portfolio:
  - ⏸️ **Hold** — Do nothing, monitor monthly
  - 🛡️ **Conservative** — 8-12% target, steady rebalancing
  - ⚡ **Aggressive** — 20-30% target, momentum-driven
  - 🌀 **Abstract** — Contrarian, sector rotation, event-driven
  - 💥 **ULTRA AGRO** — 50%+ target, concentrated + leverage plays
- **Technical Indicators** — RSI, MACD, Bollinger Bands, SMA50/200
- **Monte Carlo Projections** — 1M, 3M, 6M, 12M forecasts per strategy
- **Daily Trade Recommendation** — One specific actionable trade per day
- **Weekly Regimen** — 7-day structured habit calendar with checkboxes
- **Real-time Updates** — Prices refresh every 30s via Socket.io (falls back to simulated data if offline)

## Quick Start

```bash
npm install
npm run dev        # starts both server (port 3001) and Vite client (port 5173)
```

Open http://localhost:5173

## Production

```bash
npm run build
npm start
```

Open http://localhost:3001

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Backend**: Express + Socket.io + node-cron
- **Database**: SQLite (via better-sqlite3) — zero setup, stored in `data/portfolio.db`
- **Market Data**: Yahoo Finance API with realistic simulation fallback

## Notes

- Market data uses Yahoo Finance when available; falls back to asset-class-appropriate simulated data
- All investment data is stored locally in `data/portfolio.db`
- Recommendations are rule-based technical analysis — not financial advice
