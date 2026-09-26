import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatters'
import StockLogo from './StockLogo'
import { ArrowUpRight, ArrowDownRight, ArrowRight, Layers } from 'lucide-react'

const PortfolioOverviewMini = ({ holdings = [] }) => {
  const topHoldings = holdings.slice(0, 4)

  return (
    <section className="glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Top Portfolio Assets</h2>
              <p className="text-xs text-slate-500 dark:text-dark-400">Largest holdings by total allocation</p>
            </div>
          </div>
          <Link
            to="/portfolio"
            className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {topHoldings.length ? (
            topHoldings.map((holding) => {
              const pnl = Number(holding.profitLoss || 0)
              const isPositive = pnl >= 0

              return (
                <div
                  key={holding.symbol}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-dark-900/40 hover:bg-slate-100/90 dark:hover:bg-dark-850/60 border border-slate-200/70 dark:border-dark-700/40 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={holding.symbol} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors font-mono">
                          {holding.symbol}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-dark-400">
                          {holding.quantity} shares
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-dark-400">
                        Avg: {formatCurrency(holding.avgPrice || (holding.holdingValue / (holding.quantity || 1)))}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(holding.holdingValue)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      )}
                      <span
                        className={`text-xs font-semibold font-mono ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(pnl)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center rounded-xl bg-slate-50 dark:bg-dark-900/30 border border-dashed border-slate-200 dark:border-dark-700/60">
              <Layers className="w-8 h-8 mx-auto text-slate-400 dark:text-dark-500 mb-2" />
              <p className="text-sm text-slate-700 dark:text-dark-300 font-medium">No assets in portfolio</p>
              <p className="text-xs text-slate-500 dark:text-dark-400 mt-1 mb-3">Execute your first trade to begin tracking assets.</p>
              <Link to="/buy-sell" className="btn-primary text-xs py-1.5 px-3">
                Trade Stocks
              </Link>
            </div>
          )}
        </div>
      </div>

      {topHoldings.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-dark-700/40 flex justify-between items-center text-xs text-slate-500 dark:text-dark-400">
          <span>Active positions: <strong className="text-slate-900 dark:text-white font-mono">{holdings.length}</strong></span>
          <Link to="/portfolio" className="text-primary-600 dark:text-primary-400 hover:underline">
            Manage allocations →
          </Link>
        </div>
      )}
    </section>
  )
}

export default PortfolioOverviewMini
