import { useState, useEffect } from 'react'

const STRATEGY_COLORS = {
  hold: '#94a3b8', conservative: '#3b82f6', aggressive: '#f59e0b', abstract: '#a855f7', ultra: '#ef4444'
}

const STRATEGY_LABELS = {
  hold: 'Hold',
  conservative: 'Conservative',
  aggressive: 'Aggressive',
  abstract: 'Abstract',
  ultra: 'ULTRA AGRO'
}

function ConfidenceBar({ value, color }) {
  return (
    <div className="h-2 bg-terminal-border rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

function ActionDisplay({ action }) {
  const isBuy = action.includes('BUY') || action.includes('ADD') || action.includes('LONG')
  const isSell = action.includes('SELL') || action.includes('EXIT') || action.includes('SHORT')
  const isUltra = action.includes('⚡')

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded font-bold text-xl ${
      isBuy ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
      isSell ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
    }`}>
      {action}
    </div>
  )
}

export default function DailyRecommendation({ data }) {
  const [selectedStrategy, setSelectedStrategy] = useState(data?.targetStrategy || 'aggressive')
  const [strategyRecs, setStrategyRecs] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data?.targetStrategy) setSelectedStrategy(data.targetStrategy)
  }, [data])

  const fetchStrategyRec = async (key) => {
    if (strategyRecs[key]) return
    setLoading(true)
    try {
      const res = await fetch(`/api/analysis/strategy/${key}`)
      const d = await res.json()
      setStrategyRecs(prev => ({ ...prev, [key]: d.recommendation }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleStrategySwitch = (key) => {
    setSelectedStrategy(key)
    fetchStrategyRec(key)
  }

  if (!data || !data.analyses || data.analyses.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <div className="text-4xl mb-3">🎯</div>
        <p>Add investments to receive daily recommendations.</p>
      </div>
    )
  }

  const baseRec = data.dailyRecommendation
  const rec = strategyRecs[selectedStrategy] || (selectedStrategy === data.targetStrategy ? baseRec : null)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const actionColor =
    rec?.action?.includes('BUY') || rec?.action?.includes('ADD') ? '#22c55e' :
    rec?.action?.includes('SELL') || rec?.action?.includes('EXIT') ? '#ef4444' :
    '#f59e0b'

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-accent-teal font-bold tracking-wider">DAILY TRADE RECOMMENDATION</h2>
          <div className="text-xs text-slate-500 mt-1">{today}</div>
        </div>
        <div className="text-xs text-slate-500 text-right">
          Updates every 30s<br/>during market hours
        </div>
      </div>

      {/* Strategy selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(STRATEGY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleStrategySwitch(key)}
            className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
              selectedStrategy === key ? 'opacity-100' : 'opacity-50 hover:opacity-80'
            }`}
            style={{
              borderColor: STRATEGY_COLORS[key],
              color: selectedStrategy === key ? STRATEGY_COLORS[key] : '#94a3b8',
              backgroundColor: selectedStrategy === key ? `${STRATEGY_COLORS[key]}15` : 'transparent'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && !rec ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-8">
          <div className="w-4 h-4 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
          Analyzing market data...
        </div>
      ) : rec ? (
        <>
          {/* Main recommendation card */}
          <div className={`bg-terminal-card border rounded p-5 space-y-4 ${
            rec.action?.includes('BUY') ? 'border-green-500/30' :
            rec.action?.includes('SELL') ? 'border-red-500/30' :
            'border-terminal-border'
          }`}>
            {/* Top section */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Action for {STRATEGY_LABELS[selectedStrategy]} Strategy</div>
                <ActionDisplay action={rec.action || 'HOLD'} />
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-accent-teal font-bold text-2xl">{rec.symbol}</span>
                  {rec.currentPrice && (
                    <span className="text-slate-300">${rec.currentPrice.toFixed(2)}</span>
                  )}
                  {rec.totalReturnPct !== undefined && (
                    <span className={`text-sm ${rec.totalReturnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {rec.totalReturnPct >= 0 ? '+' : ''}{rec.totalReturnPct.toFixed(1)}% from cost
                    </span>
                  )}
                </div>
              </div>

              {/* Confidence */}
              <div className="text-center bg-terminal-bg rounded p-3 min-w-[100px]">
                <div className="text-xs text-slate-500 mb-1">CONFIDENCE</div>
                <div className="text-3xl font-bold" style={{ color: actionColor }}>{rec.confidence}%</div>
                <div className="text-xs text-slate-500 mt-1">{rec.strength}</div>
                <ConfidenceBar value={rec.confidence} color={actionColor} />
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Analysis & Reasoning</div>
              <div className="bg-terminal-bg border border-terminal-border/50 rounded p-4 text-sm text-slate-300 leading-relaxed">
                {rec.reasoning}
              </div>
            </div>

            {/* Price levels */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-terminal-bg rounded p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">CURRENT PRICE</div>
                <div className="font-bold text-slate-200">{rec.currentPrice ? `$${rec.currentPrice.toFixed(2)}` : 'N/A'}</div>
              </div>
              <div className="bg-terminal-bg rounded p-3 text-center border border-green-500/20">
                <div className="text-xs text-slate-500 mb-1">TAKE PROFIT</div>
                <div className="font-bold text-green-400">{rec.targetPrice ? `$${rec.targetPrice.toFixed(2)}` : '—'}</div>
              </div>
              <div className="bg-terminal-bg rounded p-3 text-center border border-red-500/20">
                <div className="text-xs text-slate-500 mb-1">STOP LOSS</div>
                <div className="font-bold text-red-400">{rec.stopLoss ? `$${rec.stopLoss.toFixed(2)}` : '—'}</div>
              </div>
            </div>

            {/* Risk-reward */}
            {rec.targetPrice && rec.stopLoss && rec.currentPrice && (
              <div className="bg-terminal-bg rounded p-3">
                <div className="text-xs text-slate-500 mb-2">RISK / REWARD RATIO</div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-400">Upside: +{((rec.targetPrice - rec.currentPrice) / rec.currentPrice * 100).toFixed(1)}%</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-red-400">Downside: {((rec.stopLoss - rec.currentPrice) / rec.currentPrice * 100).toFixed(1)}%</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-accent-teal font-bold">
                    R:R = {((rec.targetPrice - rec.currentPrice) / (rec.currentPrice - rec.stopLoss)).toFixed(2)}x
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* All positions overview for this strategy */}
          <div className="bg-terminal-card border border-terminal-border rounded p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ALL POSITIONS — {STRATEGY_LABELS[selectedStrategy].toUpperCase()} STRATEGY VIEW</h3>
            <div className="space-y-2">
              {data.analyses.map(a => {
                const action = a.actions[selectedStrategy]
                return (
                  <div key={a.investment.id} className="flex items-center justify-between text-xs py-2 border-b border-terminal-border/50">
                    <span className="text-accent-teal font-bold w-16">{a.investment.symbol}</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      action?.action.includes('BUY') ? 'bg-green-900/30 text-green-400' :
                      action?.action.includes('SELL') ? 'bg-red-900/30 text-red-400' :
                      action?.action.includes('TRIM') ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>{action?.action || 'HOLD'}</span>
                    <span className="text-slate-500 flex-1 mx-3 truncate">{action?.reasoning?.slice(0, 60)}...</span>
                    <span className={a.totalReturnPct >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {a.totalReturnPct >= 0 ? '+' : ''}{a.totalReturnPct.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-[10px] text-slate-600 border border-terminal-border/30 rounded p-3">
            ⚠️ DISCLAIMER: These recommendations are generated by a rule-based algorithm using technical analysis indicators (RSI, MACD, Bollinger Bands, Moving Averages). They are for educational purposes only and do not constitute financial advice. Past performance does not guarantee future results. Always consult a licensed financial advisor before making investment decisions.
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-500 text-sm">
          Click a strategy above to see its daily recommendation.
        </div>
      )}
    </div>
  )
}
