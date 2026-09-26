import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useTheme } from '../hooks/useTheme'
import { TrendingUp, PieChart as PieIcon } from 'lucide-react'

const areaData = [
  { month: 'Jan', value: 8200 },
  { month: 'Feb', value: 9100 },
  { month: 'Mar', value: 8800 },
  { month: 'Apr', value: 10400 },
  { month: 'May', value: 11800 },
  { month: 'Jun', value: 12450 },
]

const allocationData = [
  { name: 'Technology', value: 58 },
  { name: 'EV', value: 18 },
  { name: 'Cloud', value: 14 },
  { name: 'Cash', value: 10 },
]

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899']

const DashboardCharts = () => {
  const { isDark } = useTheme()

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <section className="glass-card p-6 flex flex-col justify-between">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Portfolio Performance</h2>
              <p className="text-xs text-slate-500 dark:text-dark-400">Aggregated historical equity trajectory</p>
            </div>
          </div>
          <span className="badge-green text-[10px]">+51.8% YTD</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="dashTrendGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={isDark ? 0.4 : 0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: isDark ? '1px solid rgba(51, 65, 85, 0.7)' : '1px solid #cbd5e1',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.8rem',
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#dashTrendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-card p-6 flex flex-col justify-between">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Sector Allocation</h2>
              <p className="text-xs text-slate-500 dark:text-dark-400">Diversification by industry segment</p>
            </div>
          </div>
          <span className="badge-purple text-[10px]">Macro</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={4}
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={3}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: isDark ? '1px solid rgba(51, 65, 85, 0.7)' : '1px solid #cbd5e1',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default DashboardCharts
