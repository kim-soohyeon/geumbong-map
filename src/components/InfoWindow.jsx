import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import StoreDetail from './StoreDetail'

const PANEL_W = 320
const PANEL_MAX_H = 480
const MARGIN = 12

export default function InfoWindow({ store, position, onClose }) {
  const [vw, setVw] = useState(window.innerWidth)
  const [vh, setVh] = useState(window.innerHeight)

  useEffect(() => {
    const handler = () => { setVw(window.innerWidth); setVh(window.innerHeight) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!store || !position) return null

  // 마커 오른쪽 우선, 공간 부족 시 왼쪽
  let left = position.x + 16
  if (left + PANEL_W > vw - MARGIN) {
    left = position.x - PANEL_W - 16
  }
  left = Math.max(MARGIN, left)

  // 마커 위쪽 정렬, 화면 하단 초과 시 위로 올림
  let top = position.y - 60
  if (top + PANEL_MAX_H > vh - MARGIN) {
    top = vh - PANEL_MAX_H - MARGIN
  }
  if (top < 80) top = 80

  return (
    <div
      className="w-80 bg-white rounded-2xl shadow-lg p-5 overflow-y-auto"
      style={{ position: 'absolute', left, top, zIndex: 20, maxHeight: PANEL_MAX_H }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-[#F2F4F6]"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-[#4E5968]" />
      </button>
      <StoreDetail store={store} />
    </div>
  )
}
