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
    if (!selectedSymbol) {
      return
    }

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
          setError('No historical data available for this stock.')
          return
        }

        historyCacheRef.current.set(cacheKey, mappedPoints)
        setChartData(mappedPoints)
      } catch (requestError) {
        setChartData([])
        setError(getErrorMessage(requestError, 'Unable to load historical stock data'))
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

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[#0594A4]">Watchlist</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            {selectedStockName}
          </h2>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(latestValue)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSelectorOpen((current) => !current)}
              className="flex min-w-56 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm outline-none transition hover:border-slate-300 focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600"
            >
              <span className="flex items-center gap-3">
                <StockLogo symbol={selectedSymbol} />
                <span>
                  <span className="block text-sm font-semibold text-slate-950 dark:text-white">
                    {selectedSymbol}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {selectedStockName}
                  </span>
                </span>
              </span>
              <svg
                className={`h-4 w-4 text-slate-500 transition-transform dark:text-slate-400 ${isSelectorOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isSelectorOpen && (
              <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                {availableSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => {
                      setSelectedSymbol(symbol)
                      setIsSelectorOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <StockLogo symbol={symbol} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950 dark:text-white">
                        {symbol}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {getStockName(symbol)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  selectedRange === range
                    ? 'bg-[#0594A4] text-white'
                    : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
        <StockLogo symbol={selectedSymbol} size="lg" />
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">{selectedSymbol}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoading ? 'Loading historical market data...' : 'Historical price trend'}
          </p>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>

      <div className="mt-6 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: -14, bottom: 2 }}>
            <defs>
              <linearGradient id="watchlistGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#0594A4" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#0594A4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
            <XAxis
              type="number"
              dataKey="pointId"
              domain={['dataMin', 'dataMax']}
              tickCount={6}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              tickFormatter={(value) => chartSeries[Math.round(value)]?.timeLabel || ''}
            />
            <YAxis
              tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: '#64748b', strokeDasharray: '4 4', strokeWidth: 1 }}
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.timeLabel || ''}
              contentStyle={{
                borderRadius: '0.75rem',
                border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#0594A4"
              strokeWidth={3}
              fill="url(#watchlistGradient)"
              activeDot={{ r: 5, strokeWidth: 1, stroke: '#0f172a', fill: '#0594A4' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default WatchlistChartCard
