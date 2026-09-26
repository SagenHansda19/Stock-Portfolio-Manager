import StockLogo from './StockLogo'
import { formatCurrency } from '../utils/formatters'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const MarketCard = ({ symbol, name, price, change }) => {
  const isPositive = Number(change) >= 0

  return (
    <div className="glass-card p-4 hover:border-primary-500/40 transition-all duration-300 group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StockLogo symbol={symbol} size="md" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm font-mono group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {symbol}
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-400 truncate max-w-[120px]">{name}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
            isPositive
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>
            {isPositive ? '+' : ''}
            {change}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(price)}</p>
    </div>
  )
}

export default MarketCard
