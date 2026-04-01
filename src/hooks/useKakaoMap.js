import { useState, useEffect } from 'react'

export function useKakaoMap() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (window.kakao?.maps) {
      setIsLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_APP_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(() => setIsLoaded(true))
    document.head.appendChild(script)
  }, [])

  return { isLoaded }
}
