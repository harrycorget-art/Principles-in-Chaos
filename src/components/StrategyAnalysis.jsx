import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const STRATEGY_META = {
  hold:         { color: '#94a3b8', icon: '⏸️', riskBadge: 'bg-slate-700 text-slate-300' },
  conservative: { color: '#3b82f6', icon: '🛡️', riskBadge: 'bg-blue-900/40 text-blue-300' },
  aggressive:   { color: '#f59e0b', icon: '⚡', riskBadge: 'bg-yellow-900/40 text-yellow-300' },
  abstract:     { color: '#a855f7', icon: '🌀', riskBadge: 'bg-purple-900/40 text-purple-300' },
  ultra:        { color: '#ef4444', icon: '💥', riskBadge: 'bg-red-900/40 text-red-300' },
}

function ProjectionChart({ analysis, strategies }) {
  const rows = ['Now', '1M', '3M', '6M', '1Y'].map((label, i) => {
    const row = { label }
    if (i === 0) {
      Object.keys(strategies).forEach(k => { row[k] = analysis.currentValue })
    } else {
      Object.keys(strategies).forEach(k => {
        const proj = analysis.projections[k]?.[i - 1]
        row[k] = proj ? Math.round(proj.expected * analysis.investment.shares) : analysis.currentValue
        row[`${k}_low`] = proj ? Math.round(proj.pessimistic * analysis.investment.shares) : analysis.currentValue
        row[`${k}_high`] = proj ? Math.round(proj.optimistic * analysis.investment.shares) : analysis.currentValue
      })
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v.toLocaleString()}`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0d1526', border: '1px solid #1a2d4a', fontSize: 11 }}
          formatter={(v, name) => {
            if (name.includes('_')) return null
            return [`$${v.toLocaleString()}`, strategies[name]?.label || name]
          }}
        />
        <ReferenceLine y={analysis.costBasis} stroke="#475569" strokeDasharray="4 2" label={{ value: 'Cost Basis', fill: '#475569', fontSize: 10 }} />
        {Object.keys(strategies).map(k => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            stroke={STRATEGY_META[k]?.color}
            strokeWidth={1.5}
            dot={{ r: 3, fill: STRATEGY_META[k]?.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function ActionBadge({ action }) {
  const color =
    action.includes('BUY') || action.includes('ADD') ? 'text-green-400 bg-green-900/30 border-green-500/30' :
    action.includes('SELL') || action.includes('EXIT') || action.includes('SHORT') ? 'text-red-400 bg-red-900/30 border-red-500/30' :
    action.includes('TRIM') || action.includes('REDUCE') ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30' :
    action.includes('HEDGE') || action.includes('ROTATE') ? 'text-purple-400 bg-purple-900/30 border-purple-500/30' :
    'text-slate-300 bg-slate-800 border-slate-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-bold ${color}`}>{action}</span>
  )
}

export default function StrategyAnalysis({ data, liveQuotes, onStrategyChange }) {
  const [targetStrategy, setTargetStrategy] = useState(data?.targetStrategy || 'aggressive')
  const [saving, setSaving] = useState(false)

  if (!data || !data.analyses || data.analyses.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <div className="text-4xl mb-3">📊</div>
        <p>Add investments to see strategy analysis.</p>
      </div>
    )
  }

  const { analyses, strategies, portfolio } = data

  const handleStrategyChange = async (key) => {
    setTargetStrategy(key)
    setSaving(true)
    await fetch('/api/portfolio/meta/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_strategy: key, risk_tolerance: 6, target_return: 0.25, time_horizon: 12 })
    })
    setSaving(false)
    onStrategyChange()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-accent-teal font-bold tracking-wider">STRATEGY ANALYSIS</h2>
        {saving && <span className="text-xs text-slate-500 animate-pulse">SAVING...</span>}
      </div>

      {/* Strategy selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Object.entries(strategies).map(([key, strat]) => {
          const meta = STRATEGY_META[key]
          const isActive = targetStrategy === key
          return (
            <button
              key={key}
              onClick={() => handleStrategyChange(key)}
              className={`p-3 rounded border text-left transition ${
                isActive
                  ? 'border-opacity-100 bg-terminal-hover'
                  : 'border-terminal-border hover:border-opacity-60 hover:bg-terminal-hover'
              }`}
              style={{ borderColor: isActive ? meta.color : undefined }}
            >
              <div className="text-lg mb-1">{meta.icon}</div>
              <div className="text-xs font-bold" style={{ color: meta.color }}>{strat.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{strat.riskLevel}</div>
              <div className="text-[10px] text-slate-400 mt-1">Target: {(strat.targetReturn * 100).toFixed(0)}%/yr</div>
              {isActive && <div className="text-[10px] mt-1 font-bold" style={{ color: meta.color }}>● ACTIVE</div>}
            </button>
          )
        })}
      </div>

      {/* Strategy description */}
      <div className="bg-terminal-card border border-terminal-border rounded p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{STRATEGY_META[targetStrategy]?.icon}</span>
          <div>
            <h3 className="font-bold" style={{ color: STRATEGY_META[targetStrategy]?.color }}>{strategies[targetStrategy]?.label}</h3>
            <p className="text-sm text-slate-400 mt-1">{strategies[targetStrategy]?.description}</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-slate-500">Risk: <span className={`font-bold ${STRATEGY_META[targetStrategy]?.riskBadge}`}>{strategies[targetStrategy]?.riskLevel}</span></span>
              <span className="text-slate-500">Target: <span className="font-bold text-accent-teal">{(strategies[targetStrategy]?.targetReturn * 100).toFixed(0)}% annual</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-investment analysis */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">POSITION ANALYSIS</h3>
        {analyses.map(a => {
          const live = liveQuotes[a.investment.symbol]
          const price = live?.price || a.currentPrice
          const action = a.actions[targetStrategy]

          return (
            <div key={a.investment.id} className="bg-terminal-card border border-terminal-border rounded p-4">
              {/* Header */}
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent-teal font-bold text-base">{a.investment.symbol}</span>
                    <ActionBadge action={action?.action || 'HOLD'} />
                    <span className="text-xs text-slate-500">{action?.strength}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ${price?.toFixed(2)} · {a.investment.shares} shares · ${a.currentValue.toFixed(2)} value
                  </div>
                </div>
                <div className="text-right">
                  {action?.stopLoss && (
                    <div className="text-xs"><span className="text-slate-500">Stop Loss: </span><span className="text-red-400">${action.stopLoss.toFixed(2)}</span></div>
                  )}
                  {action?.takeProfit && (
                    <div className="text-xs"><span className="text-slate-500">Take Profit: </span><span className="text-green-400">${action.takeProfit.toFixed(2)}</span></div>
                  )}
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-terminal-bg border border-terminal-border/50 rounded p-3 text-sm text-slate-300 mb-4">
                {action?.reasoning}
              </div>

              {/* Projection Chart */}
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">12-Month Projection — All Strategies</div>
                <ProjectionChart analysis={a} strategies={strategies} />
              </div>

              {/* Projection table for selected strategy */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {a.projections[targetStrategy]?.map(p => (
                  <div key={p.label} className="bg-terminal-bg rounded p-2 text-center">
                    <div className="text-slate-500 mb-1">{p.label}</div>
                    <div className="text-green-400 font-bold">${Math.round(p.optimistic * a.investment.shares).toLocaleString()}</div>
                    <div className="text-slate-300">${Math.round(p.expected * a.investment.shares).toLocaleString()}</div>
                    <div className="text-red-400">${Math.round(p.pessimistic * a.investment.shares).toLocaleString()}</div>
                    <div className="text-slate-600 text-[9px] mt-1">↑ BASE ↓</div>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-terminal-border/50 text-xs flex-wrap">
                <span>RSI <span className={`font-bold ${a.indicators.rsi > 70 ? 'text-red-400' : a.indicators.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>{a.indicators.rsi.toFixed(1)}</span></span>
                <span className="text-slate-500">|</span>
                <span>MACD <span className={`font-bold ${a.indicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>{a.indicators.macd.histogram > 0 ? 'BULLISH' : 'BEARISH'}</span></span>
                <span className="text-slate-500">|</span>
                <span>Trend <span className={a.indicators.sma50 > a.indicators.sma200 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{a.indicators.sma50 > a.indicators.sma200 ? 'GOLDEN CROSS' : 'DEATH CROSS'}</span></span>
                <span className="text-slate-500">|</span>
                <span>BB Position <span className="text-slate-300">{
                  a.currentPrice > a.indicators.bollingerBands.upper ? 'ABOVE UPPER' :
                  a.currentPrice < a.indicators.bollingerBands.lower ? 'BELOW LOWER' : 'INSIDE BANDS'
                }</span></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
