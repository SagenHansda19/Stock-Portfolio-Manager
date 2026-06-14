import StockLogo from './StockLogo'
import { formatCurrency } from '../utils/formatters'

const MarketCard = ({ symbol, name, price, change }) => {
  const isPositive = Number(change) >= 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StockLogo symbol={symbol} />
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">{symbol}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{name}</p>
          </div>
        </div>
        <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <p className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(price)}</p>
    </div>
  )
}

export default MarketCard
