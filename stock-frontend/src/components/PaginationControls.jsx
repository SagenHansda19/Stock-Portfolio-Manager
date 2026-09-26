import { ChevronLeft, ChevronRight } from 'lucide-react'

const PaginationControls = ({ page, totalPages, onPageChange, isLoading }) => {
  const canGoPrevious = page > 0
  const canGoNext = page + 1 < totalPages

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm pt-2">
      <p className="text-slate-500 dark:text-dark-400">
        Showing page <span className="font-bold text-slate-900 dark:text-white font-mono">{totalPages === 0 ? 0 : page + 1}</span> of{' '}
        <span className="font-bold text-slate-900 dark:text-white font-mono">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious || isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-dark-800/80 dark:hover:bg-dark-700/80 dark:border-dark-700/60 dark:text-white font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-dark-800/80 dark:hover:bg-dark-700/80 dark:border-dark-700/60 dark:text-white font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 shadow-xs cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
