import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../utils/formatters'

const COLORS = ['#0594A4', '#0f172a', '#64748b', '#94a3b8', '#cbd5e1']

const PortfolioBreakdownCard = ({ holdings }) => {
  const chartData = holdings.slice(0, 5).map((holding) => ({
    name: holding.symbol,
    value: Number(holding.holdingValue || 0),
  }))

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-medium text-[#0594A4]">Overview</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Investment Breakdown</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Top holdings by market value.</p>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.length ? chartData : [{ name: 'No assets', value: 1 }]}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
            >
              {(chartData.length ? chartData : [{ name: 'No assets' }]).map((entry, index) => (
                <Cell key={entry.name} fill={chartData.length ? COLORS[index % COLORS.length] : '#cbd5e1'} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 space-y-3">
        {chartData.length ? (
          chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
              </div>
              <span className="text-slate-500 dark:text-slate-400">{formatCurrency(item.value)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Buy assets to see allocation.</p>
        )}
      </div>
    </section>
  )
}

export default PortfolioBreakdownCard
