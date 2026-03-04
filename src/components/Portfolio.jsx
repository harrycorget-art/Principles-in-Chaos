import { useState } from 'react'

const TYPES = [
  { value: 'stock', label: '📈 Stock' },
  { value: 'mutual', label: '🏦 Mutual Fund' },
  { value: 'bond', label: '🏛️ Bond' },
  { value: 'crypto', label: '🔷 Crypto' },
]

function AddForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    symbol: '', type: 'stock', shares: '', buy_price: '', buy_date: new Date().toISOString().split('T')[0], reason: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.symbol || !form.shares || !form.buy_price) {
      setError('Symbol, shares, and buy price are required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, shares: parseFloat(form.shares), buy_price: parseFloat(form.buy_price) })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onAdd()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={handleSubmit} className="bg-terminal-card border border-accent-teal/30 rounded p-4 space-y-3">
      <h3 className="text-accent-teal font-bold text-sm">+ ADD INVESTMENT</h3>
      {error && <div className="text-red-400 text-xs bg-red-900/20 border border-red-500/30 rounded px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 block mb-1">SYMBOL <span className="text-red-400">*</span></label>
          <input
            value={form.symbol}
            onChange={e => set('symbol', e.target.value.toUpperCase())}
            placeholder="AAPL / BTC-USD / VTSAX"
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-slate-200 focus:border-accent-teal focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">TYPE <span className="text-red-400">*</span></label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value)}
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-slate-200 focus:border-accent-teal focus:outline-none"
          >
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">SHARES / UNITS <span className="text-red-400">*</span></label>
          <input
            type="number" step="any" min="0"
            value={form.shares}
            onChange={e => set('shares', e.target.value)}
            placeholder="10"
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-slate-200 focus:border-accent-teal focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">BUY PRICE (USD) <span className="text-red-400">*</span></label>
          <input
            type="number" step="any" min="0"
            value={form.buy_price}
            onChange={e => set('buy_price', e.target.value)}
            placeholder="150.00"
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-slate-200 focus:border-accent-teal focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">DATE PURCHASED <span className="text-red-400">*</span></label>
          <input
            type="date"
            value={form.buy_date}
            onChange={e => set('buy_date', e.target.value)}
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-slate-200 focus:border-accent-teal focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">REASON FOR BUYING</label>
          <input
            value={form.reason}
            onChange={e => set('reason', e.target.value)}
            placeholder="Long-term growth play, diversification..."
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-slate-200 focus:border-accent-teal focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit" disabled={loading}
          className="px-4 py-2 bg-accent-teal text-terminal-bg font-bold rounded text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'FETCHING PRICE...' : '+ ADD INVESTMENT'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-terminal-border rounded text-sm text-slate-400 hover:text-slate-200 transition">
          CANCEL
        </button>
      </div>
    </form>
  )
}

function EditModal({ investment, onSave, onClose }) {
  const [form, setForm] = useState({
    symbol: investment.symbol,
    type: investment.type,
    shares: investment.shares,
    buy_price: investment.buy_price,
    buy_date: investment.buy_date,
    reason: investment.reason || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await fetch(`/api/portfolio/${investment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, shares: parseFloat(form.shares), buy_price: parseFloat(form.buy_price) })
    })
    setLoading(false)
    onSave()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-terminal-card border border-terminal-border rounded p-5 w-full max-w-md">
        <h3 className="text-accent-teal font-bold mb-4">EDIT — {investment.symbol}</h3>
        <div className="space-y-3">
          {[
            { key: 'shares', label: 'Shares', type: 'number' },
            { key: 'buy_price', label: 'Buy Price', type: 'number' },
            { key: 'buy_date', label: 'Buy Date', type: 'date' },
            { key: 'reason', label: 'Reason', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-xs text-slate-500 block mb-1">{label.toUpperCase()}</label>
              <input
                type={type} step="any"
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-slate-200 focus:border-accent-teal focus:outline-none"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-accent-teal text-terminal-bg font-bold rounded text-sm">
            {loading ? 'SAVING...' : 'SAVE'}
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-terminal-border rounded text-sm text-slate-400">CANCEL</button>
        </div>
      </div>
    </div>
  )
}

const TYPE_COLORS = { stock: '#3b82f6', mutual: '#a855f7', bond: '#f59e0b', crypto: '#00d4aa' }

export default function Portfolio({ data, liveQuotes, onPortfolioChange }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const analyses = data?.analyses || []

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this investment?')) return
    setDeleting(id)
    await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
    setDeleting(null)
    onPortfolioChange()
  }

  return (
    <div className="space-y-4">
      {editTarget && (
        <EditModal
          investment={editTarget}
          onSave={() => { setEditTarget(null); onPortfolioChange() }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-accent-teal font-bold tracking-wider">PORTFOLIO</h2>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="px-4 py-2 bg-accent-teal text-terminal-bg font-bold rounded text-sm hover:opacity-90 transition"
        >
          {showAdd ? '✕ CANCEL' : '+ ADD INVESTMENT'}
        </button>
      </div>

      {showAdd && (
        <AddForm
          onAdd={() => { setShowAdd(false); onPortfolioChange() }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {analyses.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">📂</div>
          <p>No investments yet. Add your first position above.</p>
          <p className="text-xs mt-2 text-slate-600">Supports stocks, mutual funds, bonds, and crypto</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map(a => {
            const inv = a.investment
            const live = liveQuotes[inv.symbol]
            const price = live?.price || a.currentPrice || inv.buy_price
            const value = price * inv.shares
            const pnl = (price - inv.buy_price) * inv.shares
            const ret = (price - inv.buy_price) / inv.buy_price * 100
            const holdDays = Math.floor((Date.now() - new Date(inv.buy_date).getTime()) / 86400000)

            return (
              <div key={inv.id} className="bg-terminal-card border border-terminal-border rounded p-4 hover:border-accent-teal/30 transition">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  {/* Left: identity */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-accent-teal font-bold text-lg">{inv.symbol}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase"
                        style={{ backgroundColor: `${TYPE_COLORS[inv.type]}20`, color: TYPE_COLORS[inv.type] }}>
                        {inv.type}
                      </span>
                      <span className="text-slate-500 text-xs">{inv.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Bought {inv.buy_date} · Held {holdDays} days · {inv.shares} units @ ${inv.buy_price.toFixed(2)}
                    </div>
                    {inv.reason && (
                      <div className="text-xs text-slate-400 mt-1 italic max-w-xl">
                        💡 "{inv.reason}"
                      </div>
                    )}
                  </div>

                  {/* Right: numbers */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-slate-200">
                      ${price.toFixed(2)}
                      {live?.changePct !== undefined && (
                        <span className={`ml-1 text-sm ${live.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {live.changePct >= 0 ? '▲' : '▼'}{Math.abs(live.changePct).toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">Value: <span className="text-slate-200">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    <div className={`text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({ret >= 0 ? '+' : ''}{ret.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                {/* Indicators row */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-terminal-border/50 text-xs flex-wrap">
                  <span className="text-slate-500">RSI: <span className={`font-bold ${a.indicators.rsi > 70 ? 'text-red-400' : a.indicators.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>{a.indicators.rsi.toFixed(0)}</span></span>
                  <span className="text-slate-500">SMA50: <span className="text-slate-300">${a.indicators.sma50.toFixed(2)}</span></span>
                  <span className="text-slate-500">SMA200: <span className="text-slate-300">${a.indicators.sma200.toFixed(2)}</span></span>
                  <span className="text-slate-500">Trend: <span className={a.indicators.sma50 > a.indicators.sma200 ? 'text-green-400' : 'text-red-400'}>{a.indicators.sma50 > a.indicators.sma200 ? '↑ BULLISH' : '↓ BEARISH'}</span></span>
                  <span className="text-slate-500">Ann. Return: <span className={`font-bold ${a.annualizedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>{(a.annualizedReturn * 100).toFixed(1)}%/yr</span></span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-2 border-t border-terminal-border/50">
                  <button
                    onClick={() => setEditTarget(inv)}
                    className="text-xs text-slate-400 hover:text-slate-200 border border-terminal-border px-2 py-1 rounded transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(inv.id)}
                    disabled={deleting === inv.id}
                    className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 px-2 py-1 rounded transition"
                  >
                    {deleting === inv.id ? '...' : '🗑 Remove'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
