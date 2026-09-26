import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  SlidersHorizontal,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { fetchScreenerData } from '../services/api'
import StockLogo from '../components/StockLogo'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

const SECTORS = [
  'All',
  'Technology',
  'Communication Services',
  'Consumer Cyclical',
  'Financial Services',
  'Healthcare',
  'Energy',
]

const SORT_OPTIONS = [
  { value: 'marketCap', label: 'Market Cap' },
  { value: 'price', label: 'Share Price' },
  { value: 'changePercent', label: '24h Change' },
  { value: 'volume', label: 'Trading Volume' },
  { value: 'peRatio', label: 'P/E Ratio' },
]

const Screener = () => {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('All')
  const [sortBy, setSortBy] = useState('marketCap')
  const [direction, setDirection] = useState('DESC')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const loadScreener = useCallback(async () => {
    setLoading(true)
    try {
      const criteria = {
        sortBy,
        direction,
      }
      if (sector && sector !== 'All') {
        criteria.sector = sector
      }
      if (minPrice) {
        criteria.minPrice = minPrice
      }
      if (maxPrice) {
        criteria.maxPrice = maxPrice
      }

      const data = await fetchScreenerData(criteria)
      setStocks(data || [])
    } catch (err) {
      console.error('Failed to load screener data:', err)
      toast.error('Unable to fetch screener results.')
    } finally {
      setLoading(false)
    }
  }, [sector, sortBy, direction, minPrice, maxPrice])

  useEffect(() => {
    loadScreener()
  }, [loadScreener])

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))
  }

  const formatLargeNumber = (num) => {
    if (!num) return '$0'
    const n = Number(num)
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
    return `$${n.toFixed(2)}`
  }

  const formatVolume = (vol) => {
    if (!vol) return '0'
    const v = Number(vol)
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
    return v.toLocaleString()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              <SlidersHorizontal className="w-3 h-3" />
              Stock Screener
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Multi-factor Market Filter</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Equities Screener & Universe
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Filter institutional tickers by valuation, sector allocation, liquidity, and intraday velocity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadScreener}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Screener</span>
        </button>
      </div>

      {/* Control Bar: Sectors, Sorting, and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        {/* Sector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Sector:
          </span>
          {SECTORS.map((sec) => {
            const isActive = sector === sec
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-700/60'
                }`}
              >
                {sec}
              </button>
            )
          })}
        </div>

        {/* Sort & Range Inputs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Direction Toggle */}
            <button
              type="button"
              onClick={toggleDirection}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{direction}</span>
            </button>
          </div>

          {/* Min / Max Price Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Price Range:</span>
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:outline-none"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Screener Results Table */}
      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-zinc-800">
          <SlidersHorizontal className="w-8 h-8 mx-auto mb-3 text-zinc-400" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No stocks match your criteria</p>
          <p className="text-xs text-zinc-500 mt-1">Try resetting the filters or selecting another sector.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/60">
                  <th className="py-3 px-4">Ticker / Company</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">24h Change</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Market Cap</th>
                  <th className="py-3 px-4 text-right">P/E Ratio</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {stocks.map((stock) => {
                  const changeNum = Number(stock.changePercent || 0)
                  const isPositive = changeNum >= 0

                  return (
                    <motion.tr
                      key={stock.ticker}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Ticker & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <StockLogo symbol={stock.ticker} size="sm" />
                          <div>
                            <span className="font-bold text-zinc-950 dark:text-white font-mono">
                              {stock.ticker}
                            </span>
                            <span className="block text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[160px]">
                              {stock.companyName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {stock.sector}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-bold text-zinc-950 dark:text-white font-mono">
                        {formatCurrency(stock.price)}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold font-mono text-xs ${
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? `+${changeNum.toFixed(2)}%` : `${changeNum.toFixed(2)}%`}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-4 text-right text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        {formatVolume(stock.volume)}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-4 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                        {formatLargeNumber(stock.marketCap)}
                      </td>

                      {/* P/E Ratio */}
                      <td className="py-3 px-4 text-right text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        {stock.peRatio ? `${stock.peRatio}x` : '—'}
                      </td>

                      {/* Trade Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/buy-sell?symbol=${stock.ticker}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-opacity inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Trade</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Screener
