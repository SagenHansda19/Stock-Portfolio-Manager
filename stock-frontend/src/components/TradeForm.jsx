import { useEffect, useState } from 'react'
import { formatCurrency } from '../utils/formatters'
import { Plus, Minus, ArrowUpRight, ArrowDownRight, AlertCircle, Shield } from 'lucide-react'

const TradeForm = ({
  symbol = 'AAPL',
  price = 0,
  cashBalance = 0,
  holdingQuantity = 0,
  onBuy,
  onSell,
  onSubmit,
  isSubmitting = false,
  tradeAction = null,
}) => {
  const [activeTab, setActiveTab] = useState('BUY')
  const [quantity, setQuantity] = useState('1')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    setValidationError('')
  }, [symbol, activeTab])

  const parsedQty = Math.max(0, parseFloat(quantity) || 0)
  const effectivePrice = Number(price) || 0
  const orderTotal = parsedQty * effectivePrice

  const maxBuyQty = effectivePrice > 0 ? Math.floor(cashBalance / effectivePrice) : 0
  const maxSellQty = holdingQuantity || 0

  const handleQuantityChange = (val) => {
    setValidationError('')
    setQuantity(val)
  }

  const handleStep = (delta) => {
    const nextVal = Math.max(1, (parseInt(quantity, 10) || 0) + delta)
    handleQuantityChange(String(nextVal))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    const cleanSymbol = (symbol || '').trim().toUpperCase()
    const qty = Number(quantity)

    if (!cleanSymbol) {
      setValidationError('Symbol is required.')
      return
    }

    if (!qty || qty <= 0) {
      setValidationError('Please enter a valid positive share quantity.')
      return
    }

    if (activeTab === 'BUY') {
      if (orderTotal > cashBalance) {
        setValidationError(`Insufficient cash balance ($${cashBalance.toFixed(2)} available).`)
        return
      }
      if (onBuy) {
        await onBuy({ symbol: cleanSymbol, quantity: qty })
      } else if (onSubmit) {
        await onSubmit({ symbol: cleanSymbol, quantity: qty })
      }
    } else {
      if (qty > maxSellQty) {
        setValidationError(`You only hold ${maxSellQty} shares of ${cleanSymbol}.`)
        return
      }
      if (onSell) {
        await onSell({ symbol: cleanSymbol, quantity: qty })
      } else if (onSubmit) {
        await onSubmit({ symbol: cleanSymbol, quantity: qty })
      }
    }
  }

  const isBuy = activeTab === 'BUY'
  const isBusy = isSubmitting || tradeAction !== null

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Order Terminal</h2>
          <p className="text-xs text-slate-500 dark:text-dark-400">Execute instantaneous simulated market orders</p>
        </div>
        <span className="badge-blue text-[10px] font-mono">{symbol}</span>
      </div>

      {/* Buy / Sell Tab Switcher */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-dark-900/80 border border-slate-200 dark:border-dark-700/60 p-1 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('BUY')}
          className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
            isBuy
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-600 hover:text-slate-950 dark:text-dark-400 dark:hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>BUY ORDER</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SELL')}
          className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
            !isBuy
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-600 hover:text-slate-950 dark:text-dark-400 dark:hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>SELL ORDER</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quantity Field with Stepper Controls */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <label className="text-slate-700 dark:text-dark-300">Share Quantity</label>
            <span className="text-slate-500 dark:text-dark-400 font-mono">
              {isBuy ? `Max Buy: ${maxBuyQty}` : `Owned: ${maxSellQty}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-dark-800 dark:hover:bg-dark-700 dark:border-dark-700/70 dark:text-dark-300 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0.0001"
              step="any"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="input-field text-center text-lg font-bold font-mono tracking-tight"
              placeholder="1"
            />
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-dark-800 dark:hover:bg-dark-700 dark:border-dark-700/70 dark:text-dark-300 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 mt-2.5">
            {[1, 5, 10].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuantityChange(String(preset))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-slate-950 dark:bg-dark-800/80 dark:hover:bg-dark-700 dark:border-dark-700/50 dark:text-dark-300 dark:hover:text-white transition cursor-pointer font-mono"
              >
                +{preset}
              </button>
            ))}
            {isBuy && maxBuyQty > 0 && (
              <button
                type="button"
                onClick={() => handleQuantityChange(String(maxBuyQty))}
                className="px-2.5 py-1 rounded-lg bg-primary-600/15 hover:bg-primary-600/25 border border-primary-500/30 text-[11px] font-bold text-primary-600 dark:text-primary-400 transition cursor-pointer ml-auto"
              >
                Max Buy
              </button>
            )}
            {!isBuy && maxSellQty > 0 && (
              <button
                type="button"
                onClick={() => handleQuantityChange(String(maxSellQty))}
                className="px-2.5 py-1 rounded-lg bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-[11px] font-bold text-rose-600 dark:text-rose-400 transition cursor-pointer ml-auto"
              >
                Sell All
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Order Summary Box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 dark:bg-dark-900/60 dark:border-dark-700/60 p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-dark-400">Execution Price:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {price > 0 ? formatCurrency(price) : 'Fetching quote...'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-dark-400">Order Quantity:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{parsedQty} Shares</span>
          </div>

          <div className="border-t border-slate-200 dark:border-dark-700/50 pt-2 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-900 dark:text-white">Estimated Value:</span>
            <span className={`font-mono text-base ${isBuy ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(orderTotal)}
            </span>
          </div>

          {isBuy && (
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-dark-400 pt-1">
              <span>Cash Remaining:</span>
              <span className="font-mono text-slate-700 dark:text-dark-300">
                {formatCurrency(Math.max(0, cashBalance - orderTotal))}
              </span>
            </div>
          )}
        </div>

        {/* Order Action Button */}
        <button
          type="submit"
          disabled={isBusy}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            isBuy
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
          }`}
        >
          {isBusy ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Transmitting Order...</span>
            </>
          ) : (
            <>
              {isBuy ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {isBuy ? `Execute Buy Order (${symbol})` : `Execute Sell Order (${symbol})`}
              </span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-500 dark:text-dark-400 flex items-center justify-center gap-1.5 pt-1">
          <Shield className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span>Zero commission simulated institutional fill</span>
        </p>
      </form>
    </div>
  )
}

export default TradeForm
