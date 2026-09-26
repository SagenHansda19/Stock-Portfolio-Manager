import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  Award,
  CircleDollarSign,
  Activity,
} from 'lucide-react'

const getIconForLabel = (label, tone) => {
  const normalized = (label || '').toLowerCase()
  if (normalized.includes('cash') || normalized.includes('balance') || normalized.includes('liquidity')) {
    return {
      Icon: Wallet,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    }
  }
  if (normalized.includes('portfolio') || normalized.includes('net worth')) {
    return {
      Icon: CircleDollarSign,
      color: 'text-primary-600 dark:text-primary-400',
      bg: 'bg-primary-500/10 dark:bg-primary-500/15',
    }
  }
  if (normalized.includes('profit') || normalized.includes('loss') || normalized.includes('return')) {
    return tone === 'negative'
      ? { Icon: TrendingDown, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-500/15' }
      : { Icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15' }
  }
  if (normalized.includes('best') || normalized.includes('top')) {
    return { Icon: Award, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/15' }
  }
  if (normalized.includes('holding') || normalized.includes('count') || normalized.includes('assets')) {
    return { Icon: Layers, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-500/15' }
  }
  return { Icon: Activity, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10 dark:bg-primary-500/15' }
}

const DashboardCard = ({ label, value, tone = 'default', subtitle, icon: CustomIcon }) => {
  const iconConfig = getIconForLabel(label, tone)
  const IconComponent = CustomIcon || iconConfig.Icon

  const valueClass =
    tone === 'positive'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'negative'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-slate-900 dark:text-white'

  return (
    <div className="stat-card group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-400 group-hover:text-slate-700 dark:group-hover:text-dark-300 transition-colors">
          {label}
        </span>
        <div
          className={`p-2.5 rounded-xl ${iconConfig.bg} ${iconConfig.color} transition-transform duration-200 group-hover:scale-110 shadow-xs`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-2xl font-black tracking-tight ${valueClass} font-mono`}>
          {value}
        </p>
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-dark-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default DashboardCard
