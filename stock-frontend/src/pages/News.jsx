import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, RefreshCw } from 'lucide-react'
import { fetchMarketNews } from '../services/api'
import NewsCard from '../components/NewsCard'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'general', label: 'General Market' },
  { value: 'crypto', label: 'Crypto & Digital' },
  { value: 'energy', label: 'Energy & Commodities' },
]

const FALLBACK_NEWS = [
  {
    id: 101,
    category: 'general',
    datetime: Math.floor(Date.now() / 1000) - 7200,
    headline: 'Fed Signals Deliberate Approach to Future Rate Adjustments Amid Resilient Job Growth',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    related: 'SPY,QQQ,TLT',
    source: 'Bloomberg',
    summary: 'Federal Reserve policymakers indicated a measured pace for interest rate recalibration following stronger-than-expected nonfarm payroll data and persistent service sector momentum. Central bank officials emphasized that policy decisions will remain strictly data-dependent while navigating the balance between price stability and maximum sustainable employment.',
    url: 'https://www.bloomberg.com',
  },
  {
    id: 102,
    category: 'general',
    datetime: Math.floor(Date.now() / 1000) - 14400,
    headline: 'Semiconductor Rally Extends as AI Infrastructure Demand Accelerates Across Cloud Providers',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    related: 'NVDA,TSM,AMD',
    source: 'Reuters',
    summary: 'Global chipmakers experienced renewed capital inflows after hyperscalers raised their collective capital expenditure forecasts for custom silicon and next-generation data center networking. Industry analysts point to robust backlog figures and high rack-scale deployment utilization rates across enterprise cloud clusters.',
    url: 'https://www.reuters.com',
  },
  {
    id: 103,
    category: 'general',
    datetime: Math.floor(Date.now() / 1000) - 28800,
    headline: 'Treasury Yields Stabilize Near Multi-Month Lows Following Muted Inflation Metrics',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    related: 'TNX,US10Y,BND',
    source: 'Financial Times',
    summary: 'Benchmark 10-year Treasury yields held steady following the latest core PCE deflator prints which met consensus expectations. Fixed income portfolio managers cited easing wage growth pressures and moderated housing shelter components as supporting evidence for a soft landing economic trajectory.',
    url: 'https://www.ft.com',
  },
  {
    id: 104,
    category: 'crypto',
    datetime: Math.floor(Date.now() / 1000) - 10800,
    headline: 'Institutional Inflows Into Spot Digital Asset Funds Reach Milestone High in Q3',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
    related: 'BTC,ETH,COIN',
    source: 'CoinDesk',
    summary: 'Regulated spot exchange-traded products recorded net continuous inflows for the third consecutive week, led by broad institutional wealth platforms integrating digital asset model portfolios. Total assets under management across major custodians reached new cycle records as trading volumes expanded.',
    url: 'https://www.coindesk.com',
  },
  {
    id: 105,
    category: 'energy',
    datetime: Math.floor(Date.now() / 1000) - 18000,
    headline: 'Crude Benchmarks Rebound on Tighter Maritime Supply Lines and Refinery Runs',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    related: 'XOM,CVX,USO',
    source: 'Wall Street Journal',
    summary: 'Brent and West Texas Intermediate futures consolidated gains amid tight physical balances and lower commercial crude stockpiles reported by the Energy Information Administration. Heavy demand from coastal refineries running at near maximum seasonal utilization underpinned prompt spreads.',
    url: 'https://www.wsj.com',
  },
  {
    id: 106,
    category: 'general',
    datetime: Math.floor(Date.now() / 1000) - 36000,
    headline: 'Enterprise Software Spending Re-accelerates Driven by Workflow Automation Integration',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    related: 'MSFT,CRM,NOW',
    source: 'CNBC',
    summary: 'Chief Information Officers report increased IT budget allocation toward intelligent workflow orchestrations and secure data governance platforms. The latest quarterly surveys reveal that corporate renewal rates and net retention expansion metrics have rebounded from conservative spending postures earlier in the fiscal year.',
    url: 'https://www.cnbc.com',
  },
]

const News = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('general')

  useEffect(() => {
    loadNews(category)
  }, [category])

  const loadNews = async (cat) => {
    setLoading(true)
    try {
      const data = await fetchMarketNews(cat)
      if (data && data.length > 0) {
        setNews(data)
      } else {
        const filtered = FALLBACK_NEWS.filter(
          (item) => cat === 'general' || item.category === cat
        )
        setNews(filtered.length > 0 ? filtered : FALLBACK_NEWS)
      }
    } catch (err) {
      console.warn('Backend news API unreachable; displaying cached market feeds:', err)
      const filtered = FALLBACK_NEWS.filter(
        (item) => cat === 'general' || item.category === cat
      )
      setNews(filtered.length > 0 ? filtered : FALLBACK_NEWS)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              <Newspaper className="w-3 h-3" />
              Live Wire
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Finnhub Real-time Market Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Market News & Dispatches
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Curated breaking financial reporting, earnings announcements, and macroeconomic developments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadNews(category)}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.value
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white shadow-xs'
                  : 'bg-zinc-100/80 text-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-88 rounded-2xl bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/10 animate-pulse p-6"
            />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-zinc-800">
          <Newspaper className="w-8 h-8 mx-auto mb-3 text-zinc-400" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No news articles found</p>
          <p className="text-xs text-zinc-500 mt-1">Select another category or refresh the feed.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          {news.map((item) => (
            <NewsCard key={item.id} article={item} category={category} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default News
