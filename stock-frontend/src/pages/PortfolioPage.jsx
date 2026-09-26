import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import PaginationControls from '../components/PaginationControls'
import PortfolioTable from '../components/PortfolioTable'
import { getPortfolio } from '../services/portfolioService'
import { fetchPositions, fetchLivePrice } from '../services/api'
import { formatCurrency, getErrorMessage } from '../utils/formatters'
import { useAuth } from '../hooks/useAuth'
import DashboardCard from '../components/DashboardCard'
import { RefreshCw, AlertTriangle } from 'lucide-react'

const PAGE_SIZE = 100
const WatchlistChartCard = lazy(() => import('../components/WatchlistChartCard'))
const PortfolioBreakdownCard = lazy(() => import('../components/PortfolioBreakdownCard'))

const PortfolioPage = () => {
  const { setCashBalance } = useAuth()
  const [portfolio, setPortfolio] = useState(null)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      // 1. Fetch positions directly from GET /api/trade/positions
      const rawPositions = await fetchPositions()

      // 2. Fetch live prices & compute valuations for all positions
      const enrichedHoldings = await Promise.all(
        (rawPositions || []).map(async (pos) => {
          let price = Number(pos.averageBuyPrice) || 0
          try {
            const priceRes = await fetchLivePrice(pos.ticker)
            if (priceRes && priceRes.price) {
              price = Number(priceRes.price)
            }
          } catch {
            // fallback to averageBuyPrice
          }

          const qty = Number(pos.quantity) || 0
          const avgPrice = Number(pos.averageBuyPrice) || 0
          const holdingValue = qty * price
          const totalCost = qty * avgPrice
          const profitLoss = holdingValue - totalCost
          const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

          return {
            id: pos.id,
            symbol: pos.ticker,
            quantity: qty,
            averageBuyPrice: avgPrice,
            currentPrice: price,
            holdingValue,
            profitLoss,
            profitLossPercentage,
          }
        })
      )

      // 3. Compute aggregate portfolio values
      const totalHoldingsValue = enrichedHoldings.reduce((sum, h) => sum + h.holdingValue, 0)
      const totalProfitLoss = enrichedHoldings.reduce((sum, h) => sum + h.profitLoss, 0)

      // Sync user cash balance
      const summary = await getPortfolio({ page: 0, size: 1 })
      if (summary?.cashBalance !== undefined) {
        setCashBalance(summary.cashBalance)
      }

      setPortfolio({
        holdings: enrichedHoldings,
        totalPortfolioValue: totalHoldingsValue + (summary?.cashBalance || 0),
        totalProfitLoss,
        totalElements: enrichedHoldings.length,
      })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load portfolio analytics'))
    } finally {
      setIsLoading(false)
    }
  }, [setCashBalance])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchPortfolio()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchPortfolio])

  const holdings = portfolio?.holdings || []
  const bestHolding = holdings.reduce((best, current) => {
    if (!best) return current
    return Number(current.profitLoss || 0) > Number(best.profitLoss || 0) ? current : best
  }, null)

  const totalPnL = Number(portfolio?.totalProfitLoss || 0)

  return (
    <section className="space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-purple text-[10px]">Asset Ledger</span>
            <span className="text-xs text-slate-500 dark:text-dark-400">Position Level Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Portfolio Holdings & Analytics
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-400 mt-1">
            Monitor real-time position profitability, historical price charts, and sector weightings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPortfolio}
          disabled={isLoading}
          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary-600 dark:text-primary-400' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Total Portfolio Value"
          value={formatCurrency(portfolio?.totalPortfolioValue)}
          subtitle="Net equity valuation"
        />
        <DashboardCard
          label="Total Profit/Loss"
          value={`${totalPnL >= 0 ? '+' : ''}${formatCurrency(portfolio?.totalProfitLoss)}`}
          tone={totalPnL >= 0 ? 'positive' : 'negative'}
          subtitle="Unrealized position returns"
        />
        <DashboardCard
          label="Holdings Count"
          value={portfolio?.totalElements || holdings.length}
          subtitle="Active open positions"
        />
        <DashboardCard
          label="Top Performer"
          value={bestHolding ? bestHolding.symbol : 'N/A'}
          tone={bestHolding && Number(bestHolding.profitLoss || 0) >= 0 ? 'positive' : 'default'}
          subtitle={
            bestHolding
              ? `+${formatCurrency(bestHolding.profitLoss)}`
              : 'No holdings active'
          }
        />
      </div>

      {/* Charts Grid: Watchlist & Breakdown */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <Suspense
          fallback={
            <div className="glass-card p-12 flex flex-col items-center justify-center h-96">
              <div className="w-8 h-8 border-3 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-dark-300">Loading chart analytics...</p>
            </div>
          }
        >
          <WatchlistChartCard holdings={holdings} />
        </Suspense>

        <Suspense
          fallback={
            <div className="glass-card p-12 flex flex-col items-center justify-center h-96">
              <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-dark-300">Loading asset breakdown...</p>
            </div>
          }
        >
          <PortfolioBreakdownCard holdings={holdings} />
        </Suspense>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Holdings Ledger Table Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Open Asset Positions
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-400">
              Interactive watchlist table with real-time mark-to-market valuations and profit margins.
            </p>
          </div>
          <span className="badge-blue text-xs self-start sm:self-auto">
            {holdings.length} {holdings.length === 1 ? 'Asset' : 'Assets'}
          </span>
        </div>

        {isLoading && !portfolio ? (
          <div className="glass-card p-12 text-center">
            <div className="w-8 h-8 border-3 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-dark-300">Loading positions from server...</p>
          </div>
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
