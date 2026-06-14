const PaginationControls = ({ page, totalPages, onPageChange, isLoading }) => {
  const canGoPrevious = page > 0
  const canGoNext = page + 1 < totalPages

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-slate-500 dark:text-slate-400">
        Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious || isLoading}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || isLoading}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
