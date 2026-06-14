import { formatCurrency } from '../utils/formatters'

const PortfolioOverviewMini = ({ holdings }) => {
  const topHoldings = holdings.slice(0, 3)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Small Portfolio Overview</h2>
        <span className="text-xs font-medium text-[#0594A4]">Top assets</span>
      </div>

      <div className="space-y-3">
        {topHoldings.length ? (
          topHoldings.map((holding) => (
            <div key={holding.symbol} className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">{holding.symbol}</span>
              <span className="text-slate-500 dark:text-slate-400">{formatCurrency(holding.holdingValue)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No holdings yet.</p>
        )}
      </div>
    </section>
  )
}

export default PortfolioOverviewMini
