import apiClient from './apiClient'

export const getPortfolio = async (params = {}) => {
  const response = await apiClient.get('/api/portfolio', { params })
  return response.data
}
