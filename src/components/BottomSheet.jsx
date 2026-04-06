import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import StoreDetail from './StoreDetail'

export default function BottomSheet({ store, onClose }) {
  const closeRef = useRef(null)
  const [touchStartY, setTouchStartY] = useState(0)
  const [dragY, setDragY] = useState(0)

  // 열릴 때 닫기 버튼에 포커스
  useEffect(() => {
    if (store) {
      closeRef.current?.focus()
    }
  }, [store])

  // ESC 키로 닫기
  useEffect(() => {
    if (!store) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store, onClose])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20"
      style={{
        transform: store ? `translateY(${dragY}px)` : 'translateY(100%)',
        transition: dragY > 0 ? 'none' : 'transform 300ms ease-out',
      }}
      onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
      onTouchMove={(e) => {
        const delta = e.touches[0].clientY - touchStartY
        if (delta > 0) setDragY(delta)
      }}
      onTouchEnd={() => {
        if (dragY > 80) onClose()
        setDragY(0)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="판매소 정보"
        className="relative bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 max-h-[65dvh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-[#E5E8EB] rounded-full mx-auto mb-4" />
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-[#F2F4F6]"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-[#4E5968]" aria-hidden="true" />
        </button>
        <StoreDetail store={store} />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-3xl" />
      </div>
    </div>
  )
}
