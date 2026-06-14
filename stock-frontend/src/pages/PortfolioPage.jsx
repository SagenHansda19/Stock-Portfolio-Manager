import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import PaginationControls from '../components/PaginationControls'
import PortfolioTable from '../components/PortfolioTable'
import { getPortfolio } from '../services/portfolioService'
import { formatCurrency, getErrorMessage } from '../utils/formatters'
import DashboardCard from '../components/DashboardCard'

const PAGE_SIZE = 100
const WatchlistChartCard = lazy(() => import('../components/WatchlistChartCard'))
const PortfolioBreakdownCard = lazy(() => import('../components/PortfolioBreakdownCard'))

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(null)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getPortfolio({
        page,
        size: PAGE_SIZE,
        sort: 'symbol,asc',
      })
      setPortfolio(data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load portfolio'))
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchPortfolio()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchPortfolio])

  const holdings = portfolio?.holdings || []
  const bestHolding = holdings.reduce((best, current) => {
    if (!best) {
      return current
    }

    return Number(current.profitLoss || 0) > Number(best.profitLoss || 0) ? current : best
  }, null)

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-medium text-[#0594A4]">Portfolio Analytics</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">Portfolio</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track performance, allocation, and position-level profitability.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Total Portfolio Value"
          value={formatCurrency(portfolio?.totalPortfolioValue)}
        />
        <DashboardCard
          label="Total Profit/Loss"
          value={formatCurrency(portfolio?.totalProfitLoss)}
          tone={Number(portfolio?.totalProfitLoss || 0) >= 0 ? 'positive' : 'negative'}
        />
        <DashboardCard label="Holdings Count" value={portfolio?.totalElements || 0} />
        <DashboardCard
          label="Best Performing Stock"
          value={bestHolding ? bestHolding.symbol : 'N/A'}
          tone="positive"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Loading watchlist graph...
            </div>
          }
        >
          <WatchlistChartCard holdings={holdings} />
        </Suspense>
        <Suspense
          fallback={
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Loading portfolio overview...
            </div>
          }
        >
          <PortfolioBreakdownCard holdings={holdings} />
        </Suspense>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="space-y-4">
        <div className="space-y-1">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#0594A4]">My Assets</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Owned Stocks</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Watchlist-style holdings with search, sorting, and return insights.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading portfolio...</p>
        ) : (
          <>
            <PortfolioTable holdings={holdings} />
            <PaginationControls
              page={portfolio?.page || 0}
              totalPages={portfolio?.totalPages || 0}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </>
        )}
      </section>
    </section>
  )
}

export default PortfolioPage
