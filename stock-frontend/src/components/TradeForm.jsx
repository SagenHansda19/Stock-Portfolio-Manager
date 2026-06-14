import { useState } from 'react'

const TradeForm = ({ title, buttonLabel, onSubmit, isSubmitting, initialSymbol = '' }) => {
  const [formData, setFormData] = useState({ symbol: initialSymbol, quantity: '' })
  const [validationError, setValidationError] = useState('')

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setValidationError('')

    const symbol = formData.symbol.trim().toUpperCase()
    const quantity = Number(formData.quantity)

    if (!symbol) {
      setValidationError('Symbol is required')
      return
    }

    if (!quantity || quantity <= 0) {
      setValidationError('Quantity must be greater than 0')
      return
    }

    await onSubmit({ symbol, quantity })
    setFormData({ symbol: '', quantity: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>

      {validationError && (
        <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{validationError}</p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Symbol</span>
          <input
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="AAPL"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 uppercase outline-none focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Quantity</span>
          <input
            name="quantity"
            type="number"
            min="0"
            step="0.0001"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="10"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-xl bg-[#0594A4] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : buttonLabel}
      </button>
    </form>
  )
}

export default TradeForm
