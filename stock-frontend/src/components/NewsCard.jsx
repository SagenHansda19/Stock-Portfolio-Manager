import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, Clock, ExternalLink, ChevronDown, ChevronUp, Tag } from 'lucide-react'

export const getRelativeTime = (epochSeconds) => {
  if (!epochSeconds) return 'Recently'
  const seconds = epochSeconds > 1e11 ? Math.floor(epochSeconds / 1000) : epochSeconds
  const now = Math.floor(Date.now() / 1000)
  const diff = Math.max(0, now - seconds)

  if (diff < 60) return 'Just now'
  const minutes = Math.floor(diff / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return new Date(seconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const NewsCard = ({ article, category }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const relatedTickers = article.related
    ? article.related
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3)
    : []

  return (
    <motion.article
      layout
      transition={{ layout: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-950/80 border transition-all duration-200 overflow-hidden cursor-pointer shadow-xs select-none ${
        isExpanded
          ? 'border-zinc-400 dark:border-zinc-600 ring-1 ring-zinc-400/20 dark:ring-zinc-600/20'
          : 'border-zinc-200/80 dark:border-white/10 hover:border-zinc-400 dark:hover:border-zinc-700 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Crisp Cropped Header Image */}
        <div className="relative w-full h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-white/5">
          {!imageError && article.image ? (
            <img
              src={article.image}
              alt={article.headline || 'Market news headline'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900/70 text-zinc-400">
              <Newspaper className="w-8 h-8 opacity-40 mb-1.5" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Market Dispatch
              </span>
            </div>
          )}

          {/* Category Pill Overlay */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white dark:bg-white dark:text-zinc-950 backdrop-blur-md border border-white/20 dark:border-black/10 shadow-xs">
              {article.category || category || 'General'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Source and Relative Timestamp */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">
              {article.source || 'Financial Wire'}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              <Clock className="w-3 h-3" />
              {getRelativeTime(article.datetime)}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-base font-bold text-zinc-950 dark:text-white leading-snug group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            {article.headline}
          </h2>

          {/* In-Card Native Summary */}
          {article.summary && (
            <motion.div layout className="relative">
              <p
                className={`text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed transition-all ${
                  isExpanded ? '' : 'line-clamp-3'
                }`}
              >
                {article.summary}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-5 pt-0 space-y-3">
        {/* Tickers and Expand Prompt */}
        <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {relatedTickers.length > 0 ? (
              relatedTickers.map((ticker) => (
                <span
                  key={ticker}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-white/10"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {ticker}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-zinc-400 font-mono">Market</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
            <span>{isExpanded ? 'Less' : 'Read'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </div>

        {/* Expanded Secondary External Link */}
        <AnimatePresence>
          {isExpanded && article.url && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-1"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                <span>Read Full Article on {article.source || 'Publisher'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

export default NewsCard
