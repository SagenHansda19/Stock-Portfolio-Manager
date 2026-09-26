import apiClient from './apiClient'

export const getPortfolio = async (params = {}) => {
  const response = await apiClient.get('/api/portfolio', { params })
  return response.data
}

export const buyStock = async (tradeData) => {
  const response = await apiClient.post('/api/portfolio/buy', tradeData)
  return response.data
}

export const sellStock = async (tradeData) => {
  const response = await apiClient.post('/api/portfolio/sell', tradeData)
  return response.data
}

export const getStockHistory = async (symbol, range = '1D') => {
  const response = await apiClient.get(`/api/stocks/history/${symbol}`, {
    params: { range },
  })
  return response.data
}

export const getStockQuote = async (symbol) => {
  const response = await apiClient.get(`/api/stocks/${symbol}`)
  return response.data
}

export const searchStocks = async (query) => {
  const response = await apiClient.get('/api/stocks/search', {
    params: { q: query },
  })
  return response.data
}

export const analyzePortfolio = async () => {
  const response = await apiClient.get('/api/portfolio/analyze')
  return response.data
}
