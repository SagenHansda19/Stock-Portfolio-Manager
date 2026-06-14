const LOGO_CACHE_KEY = 'stock_logo_cache'
const pendingRequests = new Map()

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(LOGO_CACHE_KEY)) || {}
  } catch {
    return {}
  }
}

const writeCache = (cache) => {
  localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(cache))
}

export const getCachedLogoUrl = (symbol) => {
  const cache = readCache()
  return cache[symbol?.toUpperCase()] || ''
}

export const fetchLogoUrl = async (symbol) => {
  const normalizedSymbol = symbol?.toUpperCase()

  if (!normalizedSymbol) {
    return ''
  }

  const cachedLogoUrl = getCachedLogoUrl(normalizedSymbol)
  if (cachedLogoUrl) {
    return cachedLogoUrl
  }

  if (pendingRequests.has(normalizedSymbol)) {
    return pendingRequests.get(normalizedSymbol)
  }

  const request = fetch(`https://api.api-ninjas.com/v1/logo?ticker=${normalizedSymbol}`, {
    headers: {
      'X-Api-Key': import.meta.env.VITE_LOGO_API_KEY || '',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        return ''
      }

      const logos = await response.json()
      const logoUrl = logos?.[0]?.image || ''

      if (logoUrl) {
        const cache = readCache()
        writeCache({ ...cache, [normalizedSymbol]: logoUrl })
      }

      return logoUrl
    })
    .catch(() => '')
    .finally(() => {
      pendingRequests.delete(normalizedSymbol)
    })

  pendingRequests.set(normalizedSymbol, request)
  return request
}
