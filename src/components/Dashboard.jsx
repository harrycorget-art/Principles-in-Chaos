import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = { stock: '#3b82f6', mutual: '#a855f7', bond: '#f59e0b', crypto: '#00d4aa' }
const STRATEGY_COLORS = { hold: '#94a3b8', conservative: '#3b82f6', aggressive: '#f59e0b', abstract: '#a855f7', ultra: '#ef4444' }

function StatCard({ label, value, sub, color = 'text-white', glow }) {
  return (
    <div className={`bg-terminal-card border border-terminal-border rounded p-4 ${glow || ''}`}>
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard({ data, liveQuotes, marketOpen, onTabChange }) {
  if (!data || !data.analyses) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="text-4xl">📊</div>
        <h2 className="text-accent-teal text-lg font-bold">Welcome to Principles in Chaos</h2>
        <p className="text-slate-400 text-sm max-w-md">Your investment strategy terminal. Start by adding your investments in the Portfolio tab.</p>
        <button
          onClick={() => onTabChange('portfolio')}
          className="px-6 py-2 bg-accent-teal text-terminal-bg font-bold rounded hover:opacity-90 transition text-sm"
        >
          + ADD FIRST INVESTMENT
        </button>
      </div>
    )
  }

  const { analyses, portfolio, strategies, targetStrategy, dailyRecommendation } = data

  const sorted = [...analyses].sort((a, b) => b.totalReturn - a.totalReturn)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  // Allocation by type
  const allocation = useMemo(() => {
    const map = {}
    analyses.forEach(a => {
      map[a.investment.type] = (map[a.investment.type] || 0) + a.currentValue
    })
    return Object.entries(map).map(([type, value]) => ({ type, value, pct: (value / portfolio.totalValue * 100).toFixed(1) }))
  }, [analyses, portfolio])

  // Portfolio value over time (using projections)
  const projectionData = useMemo(() => {
    if (!analyses.length) return []
    const labels = ['Now', '1M', '3M', '6M', '1Y']
    const days = [0, 30, 91, 182, 365]
    return labels.map((label, i) => {
      const row = { label }
      if (i === 0) {
        row.current = portfolio.totalValue
        Object.keys(strategies).forEach(k => { row[k] = portfolio.totalValue })
      } else {
        Object.keys(strategies).forEach(k => {
          const total = analyses.reduce((sum, a) => {
            const proj = a.projections[k]?.[i - 1]
            return sum + (proj ? proj.expected * a.investment.shares : a.currentValue)
          }, 0)
          row[k] = Math.round(total)
        })
      }
      return row
    })
  }, [analyses, portfolio, strategies])

  const stratKey = targetStrategy || 'aggressive'
  const strat = strategies[stratKey]
  const rec = dailyRecommendation

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Portfolio"
          value={`$${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${analyses.length} position${analyses.length !== 1 ? 's' : ''}`}
          glow="glow-teal"
        />
        <StatCard
          label="Total P&L"
          value={`${portfolio.totalPnl >= 0 ? '+' : ''}$${portfolio.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${portfolio.totalReturnPct >= 0 ? '+' : ''}${portfolio.totalReturnPct.toFixed(2)}% total return`}
          color={portfolio.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}
          glow={portfolio.totalPnl >= 0 ? 'glow-green' : 'glow-red'}
        />
        <StatCard
          label="Best Performer"
          value={best ? `${best.investment.symbol} ${best.totalReturnPct >= 0 ? '+' : ''}${best.totalReturnPct.toFixed(1)}%` : 'N/A'}
          sub={best ? `$${best.pnl.toFixed(2)} profit` : ''}
          color="text-green-400"
        />
        <StatCard
          label="Needs Attention"
          value={worst && worst.totalReturnPct < 0 ? `${worst.investment.symbol} ${worst.totalReturnPct.toFixed(1)}%` : (worst ? `${worst.investment.symbol} ${worst.totalReturnPct.toFixed(1)}%` : 'N/A')}
          sub={worst ? `Strategy: ${strategies[stratKey]?.label}` : ''}
          color={worst && worst.totalReturnPct < 0 ? 'text-red-400' : 'text-yellow-400'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projection Chart */}
        <div className="md:col-span-2 bg-terminal-card border border-terminal-border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-300">PORTFOLIO PROJECTION — ALL STRATEGIES</h3>
            <span className="text-xs text-slate-500">12-month forecast</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1526', border: '1px solid #1a2d4a', borderRadius: 4 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v, name) => [`$${v.toLocaleString()}`, strategies[name]?.label || name]}
              />
              {Object.keys(strategies).map(k => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={STRATEGY_COLORS[k]}
                  strokeWidth={k === stratKey ? 2.5 : 1}
                  dot={false}
                  strokeDasharray={k === stratKey ? '' : '4 2'}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Pie */}
        <div className="bg-terminal-card border border-terminal-border rounded p-4">
          <h3 className="text-sm font-bold text-slate-300 mb-3">ALLOCATION BY TYPE</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={allocation} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
                {allocation.map((entry) => (
                  <Cell key={entry.type} fill={COLORS[entry.type] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1526', border: '1px solid #1a2d4a' }}
                formatter={(v, name) => [`$${v.toLocaleString()}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {allocation.map(({ type, value, pct }) => (
              <div key={type} className="flex justify-between text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[type] || '#64748b' }} />
                  <span className="capitalize text-slate-400">{type}</span>
                </span>
                <span className="text-slate-300">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Recommendation Banner */}
      {rec && (
        <div className={`bg-terminal-card border rounded p-4 ${
          rec.action.includes('BUY') || rec.action.includes('ADD') ? 'border-green-500/40 glow-green' :
          rec.action.includes('SELL') || rec.action.includes('EXIT') ? 'border-red-500/40 glow-red' :
          'border-terminal-border'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">TODAY'S RECOMMENDATION</span>
                <span className="text-xs bg-terminal-border rounded px-2 py-0.5 text-slate-400">{strat?.label}</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-lg font-bold ${
                  rec.action.includes('BUY') ? 'text-green-400' :
                  rec.action.includes('SELL') || rec.action.includes('EXIT') ? 'text-red-400' :
                  'text-yellow-400'
                }`}>{rec.action}</span>
                <span className="text-accent-teal font-bold">{rec.symbol}</span>
                {rec.currentPrice && <span className="text-slate-400 text-sm">${rec.currentPrice.toFixed(2)}</span>}
              </div>
              <p className="text-sm text-slate-400">{rec.reasoning}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-500 mb-1">CONFIDENCE</div>
              <div className="text-2xl font-bold text-accent-teal">{rec.confidence}%</div>
              <button
                onClick={() => onTabChange('daily')}
                className="text-xs text-accent-teal hover:underline mt-1 block"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div className="bg-terminal-card border border-terminal-border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300">LIVE POSITIONS</h3>
          <span className={`text-xs ${marketOpen ? 'text-green-400' : 'text-slate-500'}`}>
            {marketOpen ? '● LIVE' : '● CLOSED'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-terminal-border">
                <th className="text-left pb-2">SYMBOL</th>
                <th className="text-left pb-2">TYPE</th>
                <th className="text-right pb-2">SHARES</th>
                <th className="text-right pb-2">COST</th>
                <th className="text-right pb-2">PRICE</th>
                <th className="text-right pb-2">VALUE</th>
                <th className="text-right pb-2">P&L</th>
                <th className="text-right pb-2">RETURN</th>
                <th className="text-right pb-2">RSI</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map(a => {
                const live = liveQuotes[a.investment.symbol]
                const price = live?.price || a.currentPrice
                const chg = live?.changePct
                const value = price * a.investment.shares
                const pnl = (price - a.investment.buy_price) * a.investment.shares
                const ret = (price - a.investment.buy_price) / a.investment.buy_price * 100

                return (
                  <tr key={a.investment.id} className="border-b border-terminal-border/50 hover:bg-terminal-hover transition">
                    <td className="py-2 font-bold text-accent-teal">{a.investment.symbol}</td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${COLORS[a.investment.type]}20`, color: COLORS[a.investment.type] }}>
                        {a.investment.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 text-right text-slate-300">{a.investment.shares}</td>
                    <td className="py-2 text-right text-slate-400">${a.investment.buy_price.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span className="text-slate-200">${price.toFixed(2)}</span>
                      {chg !== undefined && (
                        <span className={`ml-1 text-[10px] ${chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right text-slate-200">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className={`py-2 text-right font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                    <td className={`py-2 text-right font-bold ${ret >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right">
                      <span className={`font-bold ${
                        a.indicators.rsi > 70 ? 'text-red-400' :
                        a.indicators.rsi < 30 ? 'text-green-400' :
                        'text-slate-400'
                      }`}>{a.indicators.rsi.toFixed(0)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
