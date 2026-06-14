import { useMemo, useState } from 'react'
import { formatCurrency, formatNumber } from '../utils/formatters'
import StockLogo from './StockLogo'
import { getStockName } from '../utils/stockLogos'

const SORT_OPTIONS = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'highestValue', label: 'Highest Value' },
  { value: 'highestProfit', label: 'Highest Profit' },
  { value: 'highestLoss', label: 'Highest Loss' },
]

const PortfolioTable = ({ holdings }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('alphabetical')

  const normalizedQuery = searchQuery.trim().toUpperCase()

  const displayedHoldings = useMemo(() => {
    const filtered = holdings.filter((holding) => {
      const symbol = String(holding.symbol || '').toUpperCase()
      const companyName = getStockName(holding.symbol).toUpperCase()

      if (!normalizedQuery) {
        return true
      }

      return symbol.includes(normalizedQuery) || companyName.includes(normalizedQuery)
    })

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sortBy === 'highestValue') {
        return Number(b.holdingValue || 0) - Number(a.holdingValue || 0)
      }

      if (sortBy === 'highestProfit') {
        return Number(b.profitLoss || 0) - Number(a.profitLoss || 0)
      }

      if (sortBy === 'highestLoss') {
        return Number(a.profitLoss || 0) - Number(b.profitLoss || 0)
      }

      return String(a.symbol || '').localeCompare(String(b.symbol || ''))
    })

    return sorted
  }, [holdings, normalizedQuery, sortBy])

  if (!holdings.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No holdings found.
      </div>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end sm:justify-between">
        <label className="block text-xs text-slate-600 dark:text-slate-300 sm:w-72">
          <span className="font-medium">Search Assets</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="AAPL or Apple"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block text-xs text-slate-600 dark:text-slate-300 sm:w-52">
          <span className="font-medium">Sort</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="hidden grid-cols-[minmax(180px,1.7fr)_0.8fr_1fr_1fr_1fr_1fr] items-center gap-3 border-b border-slate-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400 md:grid">
          <span>Asset</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Avg Price</span>
          <span className="text-right">Current</span>
          <span className="text-right">Value</span>
          <span className="text-right">P/L</span>
        </div>

        {!displayedHoldings.length ? (
          <div className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
            No assets match your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedHoldings.map((holding) => {
              const companyName = getStockName(holding.symbol)
              const profitLoss = Number(holding.profitLoss || 0)
              const averageBuyPrice = Number(holding.averageBuyPrice || 0)
              const currentPrice = Number(holding.currentPrice || 0)
              const holdingValue = Number(holding.holdingValue || 0)
              const profitLossPercent = averageBuyPrice > 0
                ? ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100
                : 0
              const isPositive = profitLoss >= 0

              return (
                <article
                  key={holding.symbol}
                  className="px-3 py-2 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(180px,1.7fr)_0.8fr_1fr_1fr_1fr_1fr] md:items-center md:gap-3">
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={holding.symbol} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{holding.symbol}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{companyName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs md:contents">
                      <p className="text-slate-500 dark:text-slate-400 md:hidden">Qty</p>
                      <p className="text-right text-sm text-slate-700 dark:text-slate-200">{formatNumber(holding.quantity)}</p>

                      <p className="text-slate-500 dark:text-slate-400 md:hidden">Avg Price</p>
                      <p className="text-right text-sm text-slate-700 dark:text-slate-200">{formatCurrency(averageBuyPrice)}</p>

                      <p className="text-slate-500 dark:text-slate-400 md:hidden">Current</p>
                      <p className="text-right text-sm text-slate-700 dark:text-slate-200">{formatCurrency(currentPrice)}</p>

                      <p className="text-slate-500 dark:text-slate-400 md:hidden">Value</p>
                      <p className="text-right text-sm font-medium text-slate-950 dark:text-white">{formatCurrency(holdingValue)}</p>

                      <p className="text-slate-500 dark:text-slate-400 md:hidden">P/L</p>
                      <p className={`text-right text-sm font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {`${formatCurrency(profitLoss)} (${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%)`}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default PortfolioTable
