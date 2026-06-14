import { useCallback, useEffect, useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import TradeForm from '../components/TradeForm'
import { buyStock, getPortfolio, sellStock } from '../services/portfolioService'
import { formatCurrency, getErrorMessage } from '../utils/formatters'

const BuySellPage = () => {
  const [portfolioSummary, setPortfolioSummary] = useState(null)
  const [tradeAction, setTradeAction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadSummary = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getPortfolio({ page: 0, size: 5, sort: 'symbol,asc' })
      setPortfolioSummary(data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load portfolio summary'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadSummary()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSummary])

  const handleBuy = async (tradeData) => {
    setTradeAction('buy')
    setError('')
    setSuccessMessage('')

    try {
      await buyStock(tradeData)
      setSuccessMessage(`Bought ${tradeData.quantity} share(s) of ${tradeData.symbol}`)
      await loadSummary()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to buy stock'))
    } finally {
      setTradeAction(null)
    }
  }

  const handleSell = async (tradeData) => {
    setTradeAction('sell')
    setError('')
    setSuccessMessage('')

    try {
      await sellStock(tradeData)
      setSuccessMessage(`Sold ${tradeData.quantity} share(s) of ${tradeData.symbol}`)
      await loadSummary()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to sell stock'))
    } finally {
      setTradeAction(null)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#0594A4]">Execution</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">Buy / Sell</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Execute market-price orders using live stock data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          label="Portfolio Value"
          value={isLoading ? 'Loading...' : formatCurrency(portfolioSummary?.totalPortfolioValue)}
        />
        <DashboardCard
          label="Total Profit/Loss"
          value={isLoading ? 'Loading...' : formatCurrency(portfolioSummary?.totalProfitLoss)}
          tone={Number(portfolioSummary?.totalProfitLoss || 0) >= 0 ? 'positive' : 'negative'}
        />
        <DashboardCard
          label="Holdings Count"
          value={isLoading ? '...' : portfolioSummary?.totalElements || 0}
        />
      </div>

      {successMessage && (
        <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p>
      )}

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="grid gap-4 lg:grid-cols-2">
        <TradeForm
          title="Buy Stock"
          buttonLabel="Buy"
          onSubmit={handleBuy}
          isSubmitting={tradeAction === 'buy'}
        />
        <TradeForm
          title="Sell Stock"
          buttonLabel="Sell"
          onSubmit={handleSell}
          isSubmitting={tradeAction === 'sell'}
        />
      </section>
    </section>
  )
}

export default BuySellPage
