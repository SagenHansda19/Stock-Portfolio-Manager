import { useEffect, useState } from 'react'
import { fetchLogoUrl, getCachedLogoUrl } from '../services/logoService'

export const useStockLogo = (symbol) => {
  const normalizedSymbol = symbol?.toUpperCase()
  const [logoUrl, setLogoUrl] = useState(() => getCachedLogoUrl(normalizedSymbol))

  useEffect(() => {
    setLogoUrl(getCachedLogoUrl(normalizedSymbol))
  }, [normalizedSymbol])

  useEffect(() => {
    let isMounted = true

    if (!normalizedSymbol) {
      return () => {
        isMounted = false
      }
    }

    fetchLogoUrl(normalizedSymbol).then((url) => {
      if (isMounted && url) {
        setLogoUrl(url)
      }
    })

    return () => {
      isMounted = false
    }
  }, [normalizedSymbol])

  return logoUrl
}
