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
} from 'recharts'

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

const COLORS = ['#0594A4', '#0f172a', '#64748b', '#cbd5e1']

const DashboardCharts = () => {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Portfolio Trend</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Placeholder chart data</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#0594A4" fill="#0594A4" fillOpacity={0.18} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Allocation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Placeholder sector split</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
                {allocationData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default DashboardCharts
