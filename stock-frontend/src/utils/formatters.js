export const formatCurrency = (value) => {
  const number = Number(value || 0)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}

export const formatNumber = (value) => {
  const number = Number(value || 0)

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(number)
}

export const getErrorMessage = (error, fallbackMessage) => {
  return error.response?.data?.message || fallbackMessage
}
