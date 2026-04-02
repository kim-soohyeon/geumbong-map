import { useState } from 'react'
import { LocateFixed, Loader2 } from 'lucide-react'

export default function LocationButton({ onLocate }) {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'error'

  function handleClick() {
    if (status === 'loading') return
    if (!navigator.geolocation) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('idle')
        onLocate({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 2000)
      },
      { timeout: 8000, maximumAge: 30000 }
    )
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {status === 'error' && (
        <div className="bg-white rounded-xl px-3 py-1.5 shadow-md text-[12px] text-[#F04452] whitespace-nowrap">
          위치를 가져올 수 없어요
        </div>
      )}
      <button
        onClick={handleClick}
        className={`w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
          status === 'error' ? 'bg-[#FFEEF0]' : 'hover:bg-[#F2F4F6]'
        }`}
        aria-label="내 위치로 이동"
      >
        {status === 'loading' ? (
          <Loader2 className="w-5 h-5 text-[#3182F6] animate-spin" />
        ) : (
          <LocateFixed className={`w-5 h-5 ${status === 'error' ? 'text-[#F04452]' : 'text-[#4E5968]'}`} />
        )}
      </button>
    </div>
  )
}
