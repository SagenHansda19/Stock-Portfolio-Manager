const DashboardCard = ({ label, value, tone = 'default' }) => {
  const valueClass = tone === 'positive'
    ? 'text-emerald-700 dark:text-emerald-400'
    : tone === 'negative'
      ? 'text-red-700 dark:text-red-400'
      : 'text-slate-950 dark:text-white'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  )
}

export default DashboardCard
