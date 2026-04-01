import { useState, useEffect } from 'react'

export function useStores(center, radius, piCode) {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!center) return
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      latitude: center.lat,
      longitude: center.lng,
      radius,
      minusMonths: 10,
    })
    if (piCode) params.append('piCode', piCode)

    fetch(`/api/stores?${params}`)
      .then((r) => r.json())
      .then((data) => setStores(data.output?.object?.models ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [center, radius, piCode])

  return { stores, loading, error }
}
