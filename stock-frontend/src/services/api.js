import axios from 'axios'
import { getToken } from '../utils/tokenStorage'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Bearer token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Market Data & News Services
export const fetchMarketNews = async (category = 'general') => {
  const response = await api.get('/api/market/news', {
    params: { category },
  })
  return response.data
}

export const fetchScreenerData = async (criteria = {}) => {
  const response = await api.get('/api/market/screener', {
    params: criteria,
  })
  return response.data
}

// Trading Engine Services
export const executeTrade = async ({ ticker, quantity, action }) => {
  const response = await api.post('/api/trade', {
    ticker,
    quantity: Number(quantity),
    action: action.toUpperCase(),
  })
  return response.data
}

export const fetchPositions = async () => {
  const response = await api.get('/api/trade/positions')
  return response.data
}

export const fetchTradeHistory = async () => {
  const response = await api.get('/api/trade/history')
  return response.data
}

export const fetchLivePrice = async (ticker) => {
  const response = await api.get(`/api/trade/price/${ticker}`)
  return response.data
}

export default api
