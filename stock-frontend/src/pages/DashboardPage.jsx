import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardCard from '../components/DashboardCard'
import PortfolioOverviewMini from '../components/PortfolioOverviewMini'
import AiAdvisorModal from '../components/AiAdvisorModal'
import { getPortfolio } from '../services/portfolioService'
import { formatCurrency, getErrorMessage } from '../utils/formatters'
import {
  Sparkles,
  PieChart,
  ArrowLeftRight,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react'

const MARKET_SUMMARY = [
  { label: 'S&P 500', value: '5,864.67', change: '+0.42%', positive: true },
  { label: 'Nasdaq 100', value: '20,388.24', change: '+0.71%', positive: true },
  { label: 'Dow Jones', value: '42,863.86', change: '-0.15%', positive: false },
  { label: 'CBOE Volatility (VIX)', value: '14.85', change: '-3.12%', positive: true },
]

const DashboardPage = () => {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getPortfolio({ page: 0, size: 5, sort: 'holdingValue,desc' })
        setSummary(data)
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load dashboard'))
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      fetchDashboard()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const totalProfitLoss = Number(summary?.totalProfitLoss || 0)

  return (
    <section className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Active Session</span>
            <span className="text-xs text-slate-500 dark:text-dark-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Live Market Feed
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Portfolio Command Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-400 mt-1">
            Real-time equity analytics, position valuations, and automated advisor insights.
          </p>
        </div>

        {/* AI Advisor Trigger Button */}
        <button
          type="button"
          onClick={() => setIsAdvisorOpen(true)}
          className="btn-primary group py-2.5 px-5 shadow-md flex items-center gap-2.5 text-sm font-semibold active:scale-95 cursor-pointer"
        >
          <div className="p-1 rounded-lg bg-current/15 group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-current" stroke="currentColor" fill="none" />
          </div>
          <span>AI Portfolio Advisor</span>
        </button>
      </div>

      {/* Loading Skeleton / State */}
      {isLoading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-600 dark:text-dark-300 font-medium">Aggregating real-time portfolio metrics...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Loaded */}
      {!isLoading && !error && (
        <>
          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              label="Cash Balance"
              value={formatCurrency(summary?.cashBalance)}
              subtitle="Available purchasing liquidity"
            />
            <DashboardCard
              label="Total Portfolio Value"
              value={formatCurrency(summary?.totalPortfolioValue)}
              subtitle="Holdings + Uninvested Cash"
            />
            <DashboardCard
              label="Total Profit/Loss"
              value={`${totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(summary?.totalProfitLoss)}`}
              tone={totalProfitLoss >= 0 ? 'positive' : 'negative'}
              subtitle="Net unrealized position yield"
            />
            <DashboardCard
              label="Holdings Count"
              value={summary?.totalElements || 0}
              subtitle="Active diversified positions"
            />
          </div>

          {/* Quick Action Navigation Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/portfolio"
              className="glass-card p-4 hover:border-primary-500/40 transition-all duration-300 group flex items-center gap-3.5"
            >
              <div className="p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all duration-200">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                  Detailed Portfolio
                </h2>
                <p className="text-xs text-slate-500 dark:text-dark-400">Allocations & charts</p>
              </div>
            </Link>

            <Link
              to="/buy-sell"
              className="glass-card p-4 hover:border-emerald-500/40 transition-all duration-300 group flex items-center gap-3.5"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-200">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  Trading Terminal
                </h2>
                <p className="text-xs text-slate-500 dark:text-dark-400">Buy & sell shares</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsAdvisorOpen(true)}
              className="glass-card p-4 hover:border-purple-500/40 transition-all duration-300 group flex items-center gap-3.5 text-left col-span-2 md:col-span-1 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  AI Risk Engine
                </h2>
                <p className="text-xs text-slate-500 dark:text-dark-400">Run diagnostic check</p>
              </div>
            </button>
          </div>

          {/* Holdings Snapshot & Market Pulse Section */}
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <PortfolioOverviewMini holdings={summary?.holdings || []} />

            {/* Market Pulse Summary */}
            <section className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Market Indices</h2>
                      <p className="text-xs text-slate-500 dark:text-dark-400">Macro benchmarks & sentiment</p>
                    </div>
                  </div>
                  <span className="badge-green text-[10px]">Open</span>
                </div>

                <div className="space-y-3">
                  {MARKET_SUMMARY.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-dark-900/40 border border-slate-200/70 dark:border-dark-700/40"
                    >
                      <div>
                        <span className="block text-xs font-semibold text-slate-900 dark:text-white">{item.label}</span>
                        <span className="text-xs text-slate-500 dark:text-dark-400 font-mono">{item.value}</span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg font-mono ${
                          item.positive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-dark-700/40 flex justify-between items-center text-xs text-slate-500 dark:text-dark-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Prices delayed 15m
                </span>
                <span>USD Equities</span>
              </div>
            </section>
          </div>
        </>
      )}

      {/* AI Advisor Modal */}
      <AiAdvisorModal isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />
    </section>
  )
}

export default DashboardPage
