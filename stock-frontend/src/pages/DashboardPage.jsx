import { useEffect, useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import PortfolioOverviewMini from '../components/PortfolioOverviewMini'
import { getPortfolio } from '../services/portfolioService'
import { formatCurrency, getErrorMessage } from '../utils/formatters'

const MARKET_SUMMARY = [
  { label: 'S&P 500', value: '+0.42%' },
  { label: 'Nasdaq', value: '+0.71%' },
  { label: 'Volatility', value: 'Calm' },
]

const DashboardPage = () => {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#0594A4]">Overview</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A quick portfolio snapshot.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>}

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardCard
              label="Total Portfolio Value"
              value={formatCurrency(summary?.totalPortfolioValue)}
            />
            <DashboardCard
              label="Total Profit/Loss"
              value={formatCurrency(summary?.totalProfitLoss)}
              tone={totalProfitLoss >= 0 ? 'positive' : 'negative'}
            />
            <DashboardCard label="Holdings Count" value={summary?.totalElements || 0} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <PortfolioOverviewMini holdings={summary?.holdings || []} />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Quick Market Summary</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Placeholder market pulse.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {MARKET_SUMMARY.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950"
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-950 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}

export default DashboardPage
