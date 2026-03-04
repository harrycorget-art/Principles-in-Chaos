import { useState } from 'react'

const STRATEGY_COLORS = {
  hold: '#94a3b8', conservative: '#3b82f6', aggressive: '#f59e0b', abstract: '#a855f7', ultra: '#ef4444'
}

const STRATEGY_LABELS = {
  hold: 'Hold', conservative: 'Conservative', aggressive: 'Aggressive', abstract: 'Abstract', ultra: 'ULTRA AGRO'
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function WeeklyRegimen({ data }) {
  const [selectedStrategy, setSelectedStrategy] = useState(data?.targetStrategy || 'aggressive')
  const [checked, setChecked] = useState({})
  const [strategyRegimens, setStrategyRegimens] = useState({})
  const [loading, setLoading] = useState(false)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const fetchRegimen = async (key) => {
    if (strategyRegimens[key]) return
    setLoading(true)
    try {
      const res = await fetch(`/api/analysis/strategy/${key}`)
      const d = await res.json()
      setStrategyRegimens(prev => ({ ...prev, [key]: d.weeklyRegimen }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSwitch = (key) => {
    setSelectedStrategy(key)
    fetchRegimen(key)
  }

  const regimen = strategyRegimens[selectedStrategy] || data?.weeklyRegimen || []
  const color = STRATEGY_COLORS[selectedStrategy]

  const toggleCheck = (day, task) => {
    const key = `${selectedStrategy}:${day}:${task}`
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isChecked = (day, task) => !!checked[`${selectedStrategy}:${day}:${task}`]

  const completedCount = regimen.filter(r => isChecked(r.day, r.task)).length
  const totalCount = regimen.length

  if (!data || !data.analyses || data.analyses.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <div className="text-4xl mb-3">📅</div>
        <p>Add investments to see your weekly regimen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-accent-teal font-bold tracking-wider">WEEKLY INVESTMENT REGIMEN</h2>
          <div className="text-xs text-slate-500 mt-1">Your structured habit system for consistent portfolio management</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Week Progress</div>
          <div className="text-lg font-bold" style={{ color }}>
            {completedCount}/{totalCount}
          </div>
          <div className="w-24 h-1.5 bg-terminal-border rounded-full overflow-hidden mt-1">
            <div className="h-full rounded-full transition-all" style={{ width: `${(completedCount / totalCount) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>

      {/* Strategy selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(STRATEGY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleSwitch(key)}
            className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
              selectedStrategy === key ? 'opacity-100' : 'opacity-40 hover:opacity-70'
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

      {loading && !regimen.length ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-8">
          <div className="w-4 h-4 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
          Loading regimen...
        </div>
      ) : (
        <>
          {/* Weekly calendar view */}
          <div className="space-y-2">
            {DAYS_ORDER.map(day => {
              const entry = regimen.find(r => r.day === day)
              if (!entry) return null

              const isToday = day === today
              const done = isChecked(day, entry.task)

              return (
                <div
                  key={day}
                  className={`bg-terminal-card border rounded p-4 transition ${
                    isToday ? 'border-opacity-60' : done ? 'border-terminal-border/40' : 'border-terminal-border'
                  }`}
                  style={isToday ? { borderColor: color } : {}}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCheck(day, entry.task)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        done ? 'border-transparent' : 'border-slate-600 hover:border-slate-400'
                      }`}
                      style={done ? { backgroundColor: color, borderColor: color } : {}}
                    >
                      {done && <span className="text-terminal-bg text-xs font-bold">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{entry.emoji}</span>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${isToday ? '' : 'text-slate-400'}`}
                          style={isToday ? { color } : {}}
                        >
                          {day}
                        </span>
                        {isToday && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold text-terminal-bg"
                            style={{ backgroundColor: color }}>TODAY</span>
                        )}
                        {done && <span className="text-[10px] text-slate-500 line-through">{entry.task}</span>}
                        {!done && <span className={`text-xs font-bold ${isToday ? 'text-slate-200' : 'text-slate-400'}`}>{entry.task}</span>}
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${done ? 'text-slate-600 line-through' : 'text-slate-400'}`}>
                        {entry.detail}
                      </p>
                    </div>

                    {/* Day indicator */}
                    <div className={`text-xs font-mono shrink-0 ${
                      DAYS_ORDER.indexOf(day) < DAYS_ORDER.indexOf(today) ? 'text-slate-600' :
                      isToday ? 'font-bold' : 'text-slate-500'
                    }`} style={isToday ? { color } : {}}>
                      {DAYS_ORDER.indexOf(day) < DAYS_ORDER.indexOf(today) ? 'PAST' :
                       isToday ? 'NOW' : 'UPCOMING'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Habit tips */}
          <div className="bg-terminal-card border border-terminal-border rounded p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">💡 HABIT BUILDING PRINCIPLES</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              {[
                { icon: '🔁', tip: 'Consistency beats perfection. A small action every day compounds massively.' },
                { icon: '📓', tip: 'Keep a trading journal. Document every trade with the reasoning and outcome.' },
                { icon: '🧠', tip: 'Emotions are the enemy. Stick to your strategy rules, not your feelings.' },
                { icon: '📊', tip: 'Review your thesis weekly. If the reason you bought is gone, the position should be too.' },
                { icon: '⏰', tip: 'Set specific times for market review. Constant checking breeds anxiety and bad trades.' },
                { icon: '🎯', tip: 'Define your target before buying. Know your entry, stop loss, and take profit levels.' },
              ].map(({ icon, tip }) => (
                <div key={tip} className="flex gap-2">
                  <span>{icon}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset week button */}
          <div className="flex justify-end">
            <button
              onClick={() => setChecked({})}
              className="text-xs text-slate-500 hover:text-slate-300 border border-terminal-border/50 px-3 py-1.5 rounded transition"
            >
              Reset Week Checklist
            </button>
          </div>
        </>
      )}
    </div>
  )
}
