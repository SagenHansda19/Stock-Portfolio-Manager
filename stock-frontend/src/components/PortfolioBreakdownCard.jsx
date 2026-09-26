import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../utils/formatters'
import { useTheme } from '../hooks/useTheme'
import { PieChart as PieIcon } from 'lucide-react'

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
]

const PortfolioBreakdownCard = ({ holdings = [] }) => {
  const { isDark } = useTheme()
  const totalValue = holdings.reduce((sum, h) => sum + Number(h.holdingValue || 0), 0)

  const chartData = holdings.slice(0, 6).map((holding) => ({
    name: holding.symbol,
    value: Number(holding.holdingValue || 0),
    percentage: totalValue > 0 ? ((Number(holding.holdingValue || 0) / totalValue) * 100).toFixed(1) : 0,
  }))

  return (
    <section className="glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Asset Allocation</h2>
              <p className="text-xs text-slate-500 dark:text-dark-400">Holdings weighting by market value</p>
            </div>
          </div>
          <span className="badge-blue text-[10px]">{holdings.length} Positions</span>
        </div>

        {/* Donut Chart */}
        <div className="h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.length ? chartData : [{ name: 'No assets', value: 1 }]}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={4}
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={3}
              >
                {(chartData.length ? chartData : [{ name: 'No assets' }]).map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartData.length ? COLORS[index % COLORS.length] : (isDark ? '#334155' : '#cbd5e1')}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: isDark ? '1px solid rgba(51, 65, 85, 0.7)' : '1px solid #cbd5e1',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-dark-400">
              Total Assets
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Breakdown List / Legend */}
        <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {chartData.length ? (
            chartData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-dark-900/40 dark:border-dark-750/50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-xs shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{item.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-dark-400 font-mono">({item.percentage}%)</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-dark-200 font-mono">{formatCurrency(item.value)}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 dark:text-dark-400 text-center py-4">No active assets to allocate.</p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-dark-700/40 text-[11px] text-slate-500 dark:text-dark-400 flex justify-between items-center">
        <span>Diversification: Moderate</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Healthy</span>
      </div>
    </section>
  )
}

export default PortfolioBreakdownCard
