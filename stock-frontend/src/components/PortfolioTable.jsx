import { useMemo, useState } from 'react'
import { formatCurrency, formatNumber } from '../utils/formatters'
import StockLogo from './StockLogo'
import { getStockName } from '../utils/stockLogos'
import {
  Search,
  ArrowUpDown,
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'alphabetical', label: 'Symbol (A → Z)' },
  { value: 'highestValue', label: 'Highest Value' },
  { value: 'highestProfit', label: 'Highest Profit' },
  { value: 'highestLoss', label: 'Highest Loss' },
]

const PortfolioTable = ({ holdings = [] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('highestValue')

  const normalizedQuery = searchQuery.trim().toUpperCase()

  const displayedHoldings = useMemo(() => {
    const filtered = holdings.filter((holding) => {
      const symbol = String(holding.symbol || '').toUpperCase()
      const companyName = getStockName(holding.symbol).toUpperCase()

      if (!normalizedQuery) return true
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
      <div className="glass-card p-12 text-center">
        <Inbox className="w-12 h-12 text-slate-400 dark:text-dark-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Positions Recorded</h3>
        <p className="text-sm text-slate-500 dark:text-dark-400">
          Your portfolio does not have any active holdings yet.
        </p>
      </div>
    )
  }

  return (
    <section className="glass-card overflow-hidden">
      {/* Search & Sort Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-dark-700/50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-50/80 dark:bg-dark-900/40">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-dark-400 pointer-events-none z-10" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by symbol or company name (e.g., AAPL)..."
            className="input-field !pl-10 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-dark-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-2.5 px-3 text-xs sm:text-sm cursor-pointer w-auto bg-white dark:bg-dark-800"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-dark-900 text-slate-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Header (Desktop) */}
      <div className="hidden md:grid grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr_1.2fr_1.3fr] gap-4 px-6 py-3.5 bg-slate-100/90 dark:bg-dark-900/60 border-b border-slate-200/80 dark:border-dark-700/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-dark-400">
        <span>Asset</span>
        <span className="text-right">Shares</span>
        <span className="text-right">Avg Price</span>
        <span className="text-right">Current Price</span>
        <span className="text-right">Market Value</span>
        <span className="text-right">Total P&L</span>
      </div>

      {/* Rows Container */}
      {!displayedHoldings.length ? (
        <div className="p-10 text-center text-sm text-slate-500 dark:text-dark-400">
          No assets match your search &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="divide-y divide-slate-200/80 dark:divide-dark-800/60">
          {displayedHoldings.map((holding) => {
            const companyName = getStockName(holding.symbol)
            const profitLoss = Number(holding.profitLoss || 0)
            const averageBuyPrice = Number(holding.averageBuyPrice || 0)
            const currentPrice = Number(holding.currentPrice || 0)
            const holdingValue = Number(holding.holdingValue || 0)
            const profitLossPercent =
              averageBuyPrice > 0 ? ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100 : 0
            const isPositive = profitLoss >= 0

            return (
              <div
                key={holding.symbol}
                className="px-4 sm:px-6 py-4 transition-colors hover:bg-slate-100/70 dark:hover:bg-dark-800/35 flex flex-col md:grid md:grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr_1.2fr_1.3fr] md:items-center gap-3 md:gap-4"
              >
                {/* Asset Identity */}
                <div className="flex items-center gap-3">
                  <StockLogo symbol={holding.symbol} size="md" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white text-sm block font-mono hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {holding.symbol}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-dark-400 truncate block max-w-[160px]">
                      {companyName}
                    </span>
                  </div>
                </div>

                {/* Mobile Grid Layout for Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs md:contents">
                  <div className="md:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-dark-400 md:hidden block">Shares</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-dark-200 font-mono">
                      {formatNumber(holding.quantity)}
                    </span>
                  </div>

                  <div className="md:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-dark-400 md:hidden block">Avg Price</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-dark-200 font-mono">
                      {formatCurrency(averageBuyPrice)}
                    </span>
                  </div>

                  <div className="md:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-dark-400 md:hidden block">Current Price</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(currentPrice)}
                    </span>
                  </div>

                  <div className="md:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-dark-400 md:hidden block">Market Value</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(holdingValue)}
                    </span>
                  </div>

                  <div className="col-span-2 md:col-span-1 md:text-right flex items-center justify-between md:justify-end gap-1.5 mt-1 md:mt-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-dark-400 md:hidden">P&L:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {formatCurrency(profitLoss)} ({isPositive ? '+' : ''}
                          {profitLossPercent.toFixed(2)}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default PortfolioTable
