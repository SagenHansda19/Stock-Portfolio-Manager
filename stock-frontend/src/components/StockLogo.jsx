import { getStockLogo } from '../utils/stockLogos'
import { useStockLogo } from '../hooks/useStockLogo'

const StockLogo = ({ symbol, size = 'md' }) => {
  const logo = getStockLogo(symbol)
  const logoUrl = useStockLogo(symbol)
  const sizeClass = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'

  if (logoUrl) {
    return (
      <div className="bg-white rounded-full p-1 shrink-0 flex items-center justify-center shadow-xs border border-slate-200">
        <img
          src={logoUrl}
          alt={`${symbol} logo`}
          className={`${sizeClass} rounded-full object-contain`}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full font-bold shadow-xs ${
        logo.className ||
        'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'
      }`}
    >
      {logo.label || symbol?.slice(0, 2) || 'ST'}
    </span>
  )
}

export default StockLogo
