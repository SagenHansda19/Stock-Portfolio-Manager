import { getStockLogo } from '../utils/stockLogos'
import { useStockLogo } from '../hooks/useStockLogo'

const StockLogo = ({ symbol, size = 'md' }) => {
  const logo = getStockLogo(symbol)
  const logoUrl = useStockLogo(symbol)
  const sizeClass = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${symbol} logo`}
        className={`${sizeClass} shrink-0 rounded-full border border-slate-200 bg-white object-contain p-1 dark:border-slate-700`}
        loading="lazy"
      />
    )
  }

  return (
    <span className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full text-sm font-semibold ${logo.className}`}>
      {logo.label}
    </span>
  )
}

export default StockLogo
