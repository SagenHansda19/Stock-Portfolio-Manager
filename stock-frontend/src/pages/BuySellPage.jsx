import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DashboardCard from '../components/DashboardCard'
import TradeForm from '../components/TradeForm'
import {
  getPortfolio,
  getStockHistory,
  getStockQuote,
  searchStocks,
} from '../services/portfolioService'
import { executeTrade, fetchPositions, fetchLivePrice } from '../services/api'
import { formatCurrency, getErrorMessage } from '../utils/formatters'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import StockLogo from '../components/StockLogo'
import { getStockName } from '../utils/stockLogos'
import toast from 'react-hot-toast'
import {
  Search,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
  Flame,
  X,
} from 'lucide-react'

const TIME_RANGES = ['1D', '1W', '1M', '1Y']
const TRENDING_TICKERS = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'GOOGL', 'META']

const BuySellPage = () => {
  const { cashBalance, setCashBalance } = useAuth()
  const { isDark } = useTheme()

  const [portfolioSummary, setPortfolioSummary] = useState(null)
  const [tradeAction, setTradeAction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [searchParams] = useSearchParams()
  const urlSymbol = searchParams.get('symbol')?.toUpperCase()

  // Search & Chart States
  const [searchSymbol, setSearchSymbol] = useState(urlSymbol || 'AAPL')
  const [querySymbol, setQuerySymbol] = useState(urlSymbol || 'AAPL')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [livePrice, setLivePrice] = useState(null)
  const [chartData, setChartData] = useState([])
  const [selectedRange, setSelectedRange] = useState('1M')
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [chartError, setChartError] = useState('')

  const comboboxRef = useRef(null)

  useEffect(() => {
    if (urlSymbol && urlSymbol !== searchSymbol) {
      setSearchSymbol(urlSymbol)
      setQuerySymbol(urlSymbol)
    }
  }, [urlSymbol, searchSymbol])

  // Click outside listener for combobox dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch positions directly from GET /api/trade/positions
      const positions = await fetchPositions()
      const holdings = (positions || []).map((pos) => ({
        symbol: pos.ticker,
        quantity: Number(pos.quantity) || 0,
        averageBuyPrice: Number(pos.averageBuyPrice) || 0,
      }))
      setPortfolioSummary({
        holdings,
      })

      // Sync cash balance
      const data = await getPortfolio({ page: 0, size: 1 })
      if (data?.cashBalance !== undefined) {
        setCashBalance(data.cashBalance)
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load portfolio summary'))
    } finally {
      setIsLoading(false)
    }
  }, [setCashBalance])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  // Load live price and history for the searched symbol
  const loadStockData = useCallback(async () => {
    if (!searchSymbol) return
    setIsChartLoading(true)
    setChartError('')
    try {
      const quote = await getStockQuote(searchSymbol)
      setLivePrice(Number(quote.price))

      const history = await getStockHistory(searchSymbol, selectedRange)
      const mappedPoints = (history || [])
        .map((point) => ({
          time: point.time,
          price: Number(point.price),
        }))
        .filter((point) => Number.isFinite(point.price))

      setChartData(mappedPoints)
    } catch (err) {
      setChartError(getErrorMessage(err, 'Unable to load stock details'))
      setChartData([])
      setLivePrice(null)
    } finally {
      setIsChartLoading(false)
    }
  }, [searchSymbol, selectedRange])

  useEffect(() => {
    loadStockData()
  }, [loadStockData])

  // Debounce search input to load autocomplete suggestions
  useEffect(() => {
    if (!querySymbol.trim()) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    if (querySymbol.toUpperCase() === searchSymbol.toUpperCase()) {
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchStocks(querySymbol)
        const results = (data?.result || []).slice(0, 6)
        setSuggestions(results)
      } catch (err) {
        console.error('Error fetching suggestions:', err)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [querySymbol, searchSymbol])

  const handleSelectStock = (ticker) => {
    const clean = ticker.trim().toUpperCase()
    if (!clean) return
    setSearchSymbol(clean)
    setQuerySymbol(clean)
    setSuggestions([])
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    handleSelectStock(querySymbol)
  }

  const handleClearSearch = () => {
    setQuerySymbol('')
    setSuggestions([])
  }

  const handleBuy = async (tradeData) => {
    setTradeAction('buy')
    setError('')
    setSuccessMessage('')
    try {
      const ticker = (tradeData.symbol || tradeData.ticker || searchSymbol).toUpperCase()
      const quantity = Number(tradeData.quantity)
      const res = await executeTrade({
        ticker,
        quantity,
        action: 'BUY',
      })
      toast.success(res.message || `Order Executed: Bought ${quantity} share(s) of ${ticker}`)
      setSuccessMessage(res.message || `Order Executed: Bought ${quantity} share(s) of ${ticker}`)

      // Update cash balance immediately so the navbar pill reflects the new balance dynamically
      if (res.remainingCashBalance !== undefined) {
        setCashBalance(Number(res.remainingCashBalance))
      }

      await loadSummary()
      if (ticker === searchSymbol) {
        loadStockData()
      }
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        toast.error('Trade collision detected. Please retry.')
        setError('Trade collision detected. Please retry.')
      } else {
        const msg = requestError.response?.data?.message || getErrorMessage(requestError, 'Unable to execute buy order')
        toast.error(msg)
        setError(msg)
      }
    } finally {
      setTradeAction(null)
    }
  }

  const handleSell = async (tradeData) => {
    setTradeAction('sell')
    setError('')
    setSuccessMessage('')
    try {
      const ticker = (tradeData.symbol || tradeData.ticker || searchSymbol).toUpperCase()
      const quantity = Number(tradeData.quantity)
      const res = await executeTrade({
        ticker,
        quantity,
        action: 'SELL',
      })
      toast.success(res.message || `Order Executed: Sold ${quantity} share(s) of ${ticker}`)
      setSuccessMessage(res.message || `Order Executed: Sold ${quantity} share(s) of ${ticker}`)

      // Update cash balance immediately
      if (res.remainingCashBalance !== undefined) {
        setCashBalance(Number(res.remainingCashBalance))
      }

      await loadSummary()
      if (ticker === searchSymbol) {
        loadStockData()
      }
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        toast.error('Trade collision detected. Please retry.')
        setError('Trade collision detected. Please retry.')
      } else {
        const msg = requestError.response?.data?.message || getErrorMessage(requestError, 'Unable to execute sell order')
        toast.error(msg)
        setError(msg)
      }
    } finally {
      setTradeAction(null)
    }
  }

  const chartSeries = useMemo(
    () =>
      chartData.map((point, index) => ({
        pointId: index,
        timeLabel: point.time,
        price: point.price,
      })),
    [chartData],
  )

  const currentHolding = portfolioSummary?.holdings?.find((h) => h.symbol === searchSymbol)
  const holdingQuantity = currentHolding?.quantity || 0

  return (
    <section className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-green text-[10px]">Execution Desk</span>
            <span className="text-xs text-slate-500 dark:text-dark-400">Direct Simulated Exchange Routing</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Trading Desk & Execution
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-400 mt-1">
            Perform institutional research, inspect real-time pricing, and execute trades instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 dark:bg-dark-800/80 dark:border-dark-700/60 dark:text-dark-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span>Equities: Market Open</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Available Liquidity"
          value={cashBalance !== null ? formatCurrency(cashBalance) : 'Loading...'}
          subtitle="Cash available to purchase"
        />
        <DashboardCard
          label="Total Portfolio Value"
          value={isLoading ? 'Loading...' : formatCurrency(portfolioSummary?.totalPortfolioValue)}
          subtitle="Combined net holdings value"
        />
        <DashboardCard
          label="Total Profit/Loss"
          value={isLoading ? 'Loading...' : formatCurrency(portfolioSummary?.totalProfitLoss)}
          tone={Number(portfolioSummary?.totalProfitLoss || 0) >= 0 ? 'positive' : 'negative'}
          subtitle="Unrealized position profit"
        />
        <DashboardCard
          label="Active Holdings"
          value={isLoading ? '...' : portfolioSummary?.totalElements || 0}
          subtitle="Position ledger count"
        />
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Column Trading Cockpit */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        {/* Left Side: Stock Search, Combobox, Trending Tickers & Live Chart */}
        <div className="glass-card p-6 space-y-6">
          {/* Combobox Search and Time Range Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Autocomplete Combobox */}
              <div ref={comboboxRef} className="relative flex-1 max-w-md z-30">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-dark-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search stock symbol... (AAPL, NVDA, TSLA)"
                    value={querySymbol}
                    onChange={(e) => setQuerySymbol(e.target.value)}
                    className="input-field !pl-10 !pr-10 text-xs sm:text-sm uppercase font-mono font-semibold"
                  />

                  {/* Clear / Loading indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isSearching ? (
                      <RefreshCw className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 animate-spin" />
                    ) : querySymbol ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                </form>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-dark-900/95 backdrop-blur-2xl border border-slate-200 dark:border-dark-700/80 p-1.5 shadow-xl dark:shadow-2xl animate-slide-up">
                    <li className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-dark-400">
                      Search Suggestions
                    </li>
                    {suggestions.map((item) => (
                      <li key={item.symbol}>
                        <button
                          type="button"
                          onClick={() => handleSelectStock(item.symbol)}
                          className="w-full px-3.5 py-2.5 text-left text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800/80 transition flex items-center justify-between cursor-pointer group"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white font-mono group-hover:text-primary-600 dark:group-hover:text-primary-400">
                              {item.symbol}
                            </span>
                            <span className="ml-2 text-slate-500 dark:text-dark-400">— {item.description}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Time Range Selector */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-dark-900/80 border border-slate-200 dark:border-dark-700/60 p-1 self-start sm:self-auto">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setSelectedRange(range)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedRange === range
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 dark:text-dark-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-dark-800/50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Tickers Quick-Select Pill Row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-dark-400 flex items-center gap-1 mr-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending:</span>
              </span>
              {TRENDING_TICKERS.map((ticker) => {
                const isSelected = searchSymbol === ticker
                return (
                  <button
                    key={ticker}
                    type="button"
                    onClick={() => handleSelectStock(ticker)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-dark-800 dark:hover:bg-dark-750 dark:text-dark-300 dark:hover:text-white border border-slate-200/80 dark:border-dark-700/50'
                    }`}
                  >
                    {ticker}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stock Header Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-dark-900/40 border border-slate-200/80 dark:border-dark-700/50">
            <div className="flex items-center gap-3.5">
              <StockLogo symbol={searchSymbol} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-mono">{searchSymbol}</h2>
                  <span className="badge-blue text-[10px]">NASDAQ</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-dark-400">{getStockName(searchSymbol)}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {livePrice !== null ? formatCurrency(livePrice) : 'Loading...'}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                <span>Realtime Quote</span>
              </p>
            </div>
          </div>

          {chartError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 text-xs">
              {chartError}
            </div>
          )}

          {/* Chart Canvas */}
          <div className="h-80 w-full relative">
            {isChartLoading && (
              <div className="absolute inset-0 bg-white/40 dark:bg-dark-950/40 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading candlestick tick data...</span>
                </div>
              </div>
            )}

            {chartSeries.length === 0 && !isChartLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500 dark:text-dark-400">
                No history data available for this symbol.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tradeGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={isDark ? 0.4 : 0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
                  <XAxis
                    type="number"
                    dataKey="pointId"
                    domain={['dataMin', 'dataMax']}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => chartSeries[Math.round(value)]?.timeLabel || ''}
                  />
                  <YAxis
                    domain={[(min) => min * 0.998, (max) => max * 1.002]}
                    tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ stroke: '#6366f1', strokeDasharray: '3 3' }}
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.timeLabel || ''}
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: isDark ? '1px solid rgba(51, 65, 85, 0.7)' : '1px solid #cbd5e1',
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#tradeGradient)"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: isDark ? '#020617' : '#ffffff', fill: '#818cf8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Side: Institutional Trading Console */}
        <div>
          <TradeForm
            symbol={searchSymbol}
            price={livePrice || 0}
            cashBalance={cashBalance || 0}
            holdingQuantity={holdingQuantity}
            onBuy={handleBuy}
            onSell={handleSell}
            tradeAction={tradeAction}
          />
        </div>
      </div>
    </section>
  )
}

export default BuySellPage
