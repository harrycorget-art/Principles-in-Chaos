import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import Dashboard from './components/Dashboard.jsx'
import Portfolio from './components/Portfolio.jsx'
import StrategyAnalysis from './components/StrategyAnalysis.jsx'
import DailyRecommendation from './components/DailyRecommendation.jsx'
import WeeklyRegimen from './components/WeeklyRegimen.jsx'

const socket = io('/', { transports: ['websocket', 'polling'] })

const NAV = [
  { key: 'dashboard', label: '⬛ Dashboard', short: 'DASH' },
  { key: 'portfolio', label: '📁 Portfolio', short: 'PORT' },
  { key: 'analysis', label: '📊 Strategy Analysis', short: 'ANLZ' },
  { key: 'daily', label: '🎯 Daily Trade', short: 'DAILY' },
  { key: 'weekly', label: '📅 Weekly Regimen', short: 'WEEKLY' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveQuotes, setLiveQuotes] = useState({})
  const [marketOpen, setMarketOpen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [settings, setSettings] = useState(null)

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await fetch('/api/analysis')
      const data = await res.json()
      setAnalysisData(data)
      setSettings(data.targetStrategy)
    } catch (e) {
      console.error('Analysis fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalysis()

    socket.on('priceUpdate', ({ quotes, timestamp, marketOpen: mo }) => {
      setMarketOpen(mo)
      setLastUpdate(new Date(timestamp).toLocaleTimeString())
      const quoteMap = {}
      quotes.forEach(q => {
        if (q.quote) quoteMap[q.symbol] = q.quote
      })
      setLiveQuotes(quoteMap)
    })

    return () => socket.off('priceUpdate')
  }, [fetchAnalysis])

  const onPortfolioChange = () => {
    setLoading(true)
    fetchAnalysis()
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-slate-200 font-mono">
      {/* Header */}
      <header className="border-b border-terminal-border bg-terminal-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-accent-teal font-bold text-lg tracking-widest">⚡ PRINCIPLES·IN·CHAOS</span>
            <span className="text-xs text-slate-500 hidden sm:block">INVESTMENT TERMINAL v1.0</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className={`flex items-center gap-1 ${marketOpen ? 'text-green-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${marketOpen ? 'bg-green-400 pulse-live' : 'bg-slate-600'}`} />
              {marketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
            </span>
            {lastUpdate && (
              <span className="text-slate-500">UPD {lastUpdate}</span>
            )}
            {analysisData?.portfolio && (
              <span className={`font-bold ${analysisData.portfolio.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${analysisData.portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
        {/* Nav */}
        <nav className="flex border-t border-terminal-border overflow-x-auto">
          {NAV.map(({ key, label, short }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-xs whitespace-nowrap transition-all border-b-2 ${
                activeTab === key
                  ? 'border-accent-teal text-accent-teal bg-terminal-hover'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-terminal-hover'
              }`}
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="p-4 max-w-screen-xl mx-auto">
        {loading && !analysisData ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">FETCHING MARKET DATA...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                data={analysisData}
                liveQuotes={liveQuotes}
                marketOpen={marketOpen}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'portfolio' && (
              <Portfolio
                data={analysisData}
                liveQuotes={liveQuotes}
                onPortfolioChange={onPortfolioChange}
              />
            )}
            {activeTab === 'analysis' && (
              <StrategyAnalysis
                data={analysisData}
                liveQuotes={liveQuotes}
                onStrategyChange={onPortfolioChange}
              />
            )}
            {activeTab === 'daily' && (
              <DailyRecommendation
                data={analysisData}
                liveQuotes={liveQuotes}
              />
            )}
            {activeTab === 'weekly' && (
              <WeeklyRegimen data={analysisData} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
