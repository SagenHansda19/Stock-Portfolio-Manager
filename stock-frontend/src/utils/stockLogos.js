const STOCK_LOGOS = {
  AAPL: { label: 'A', name: 'Apple Inc.', className: 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' },
  MSFT: { label: 'M', name: 'Microsoft Corp.', className: 'bg-blue-600 text-white' },
  TSLA: { label: 'T', name: 'Tesla Inc.', className: 'bg-red-600 text-white' },
  NVDA: { label: 'N', name: 'NVIDIA Corp.', className: 'bg-emerald-600 text-white' },
  AMZN: { label: 'A', name: 'Amazon.com Inc.', className: 'bg-amber-500 text-slate-950' },
  GOOGL: { label: 'G', name: 'Alphabet Inc.', className: 'bg-sky-600 text-white' },
  META: { label: 'M', name: 'Meta Platforms', className: 'bg-indigo-600 text-white' },
}

export const getStockLogo = (symbol) => {
  const normalizedSymbol = symbol?.toUpperCase()

  return STOCK_LOGOS[normalizedSymbol] || {
    label: normalizedSymbol?.slice(0, 1) || '?',
    name: `${normalizedSymbol || 'Stock'} Holding`,
    className: 'bg-[#0594A4] text-white',
  }
}

export const getStockName = (symbol) => {
  return getStockLogo(symbol).name
}
