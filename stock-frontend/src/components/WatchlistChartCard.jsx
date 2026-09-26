import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StockLogo from './StockLogo'
import { formatCurrency, getErrorMessage } from '../utils/formatters'
import { getStockName } from '../utils/stockLogos'
import { getStockHistory } from '../services/portfolioService'
import { useTheme } from '../hooks/useTheme'
import { ChevronDown, RefreshCw, AlertCircle } from 'lucide-react'

const TIME_RANGES = ['1D', '1W', '1M', '1Y', 'ALL']
const DEFAULT_WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'NVDA']

const WatchlistChartCard = ({ holdings = [] }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [selectedRange, setSelectedRange] = useState('1D')
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const historyCacheRef = useRef(new Map())
  const { isDark } = useTheme()

  const availableSymbols = useMemo(() => {
    const ownedSymbols = holdings
      .map((holding) => holding.symbol)
      .filter(Boolean)
      .map((symbol) => String(symbol).toUpperCase())

    const mergedSymbols = [...ownedSymbols, ...DEFAULT_WATCHLIST_SYMBOLS]
    return [...new Set(mergedSymbols)]
  }, [holdings])

  useEffect(() => {
    if (!availableSymbols.includes(selectedSymbol)) {
      setSelectedSymbol(availableSymbols[0] || 'AAPL')
    }
  }, [availableSymbols, selectedSymbol])

  useEffect(() => {
    if (!selectedSymbol) return

    const cacheKey = `${selectedSymbol}:${selectedRange}`
    const cachedData = historyCacheRef.current.get(cacheKey)
    if (cachedData) {
      setChartData(cachedData)
      setError('')
      return
    }

    const loadHistory = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await getStockHistory(selectedSymbol, selectedRange)
        const mappedPoints = (response || [])
          .map((point) => ({
            time: point.time,
            price: Number(point.price),
          }))
          .filter((point) => Number.isFinite(point.price))

        if (mappedPoints.length === 0) {
          setChartData([])
          setError('No historical data points available for this period.')
          return
        }

        historyCacheRef.current.set(cacheKey, mappedPoints)
        setChartData(mappedPoints)
      } catch (requestError) {
        setChartData([])
        setError(getErrorMessage(requestError, 'Unable to load historical price action'))
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [selectedRange, selectedSymbol])

  const selectedStockName = getStockName(selectedSymbol)
  const chartSeries = useMemo(
    () =>
      chartData.map((point, index) => ({
        pointId: index,
        timeLabel: point.time,
        price: point.price,
      })),
    [chartData],
  )
  const latestValue = chartSeries.at(-1)?.price || 0
  const firstValue = chartSeries[0]?.price || 0
  const changeValue = latestValue - firstValue
  const changePercent = firstValue > 0 ? (changeValue / firstValue) * 100 : 0
  const isPositiveTrend = changeValue >= 0

  return (
    <section className="glass-card p-6 flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-purple text-[10px]">Technical Chart</span>
            <span className="text-xs text-slate-500 dark:text-dark-400 font-mono">Range: {selectedRange}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {formatCurrency(latestValue)}
            </h2>
            {chartSeries.length > 1 && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
                  isPositiveTrend
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                }`}
              >
                {isPositiveTrend ? '+' : ''}
                {changePercent.toFixed(2)}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-dark-400 mt-1">
            {selectedSymbol} — {selectedStockName}
          </p>
        </div>

        {/* Right Controls: Symbol Selector & Time Range Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Symbol Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSelectorOpen((current) => !current)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-dark-800/80 dark:hover:bg-dark-750/90 dark:border-dark-700/60 text-left shadow-xs transition cursor-pointer"
            >
              <StockLogo symbol={selectedSymbol} size="sm" />
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{selectedSymbol}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-dark-400 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSelectorOpen && (
              <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl bg-white dark:bg-dark-900/95 backdrop-blur-2xl border border-slate-200 dark:border-dark-700/80 shadow-xl dark:shadow-2xl p-1.5 animate-slide-up">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-dark-400 px-3 py-1.5">
                  Select Stock
                </p>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {availableSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      type="button"
                      onClick={() => {
                        setSelectedSymbol(symbol)
                        setIsSelectorOpen(false)
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition text-xs font-semibold cursor-pointer ${
                        selectedSymbol === symbol
                          ? 'bg-primary-600/15 text-primary-600 dark:bg-primary-600/20 dark:text-primary-400 border border-primary-500/30'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-dark-300 dark:hover:text-white dark:hover:bg-dark-800/60'
                      }`}
                    >
                      <StockLogo symbol={symbol} size="sm" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white block">{symbol}</span>
                        <span className="text-[10px] text-slate-500 dark:text-dark-400 truncate block">
                          {getStockName(symbol)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time Range Filter Pills */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-dark-900/60 border border-slate-200 dark:border-dark-700/50 p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  selectedRange === range
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200 dark:text-dark-400 dark:hover:text-white dark:hover:bg-dark-800/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 h-80 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-dark-950/50 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching tick stream...</span>
            </div>
          </div>
        )}

        {error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-dark-900/30 border border-slate-200 dark:border-dark-800">
            <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 mb-2" />
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{error}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400 mt-1">Try switching to another time interval or symbol.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: -14, bottom: 2 }}>
              <defs>
                <linearGradient id="watchlistGlow" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={isDark ? 0.45 : 0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
              <XAxis
                type="number"
                dataKey="pointId"
                domain={['dataMin', 'dataMax']}
                tickCount={6}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => chartSeries[Math.round(value)]?.timeLabel || ''}
              />
              <YAxis
                domain={[(min) => min * 0.998, (max) => max * 1.002]}
                tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                tickLine={false}
                axisLine={false}
                width={64}
                tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ stroke: '#6366f1', strokeDasharray: '3 3', strokeWidth: 1.5 }}
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.timeLabel || ''}
                contentStyle={{
                  borderRadius: '0.85rem',
                  border: isDark ? '1px solid rgba(51, 65, 85, 0.7)' : '1px solid #cbd5e1',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#watchlistGlow)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: isDark ? '#020617' : '#ffffff', fill: '#818cf8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default WatchlistChartCard
