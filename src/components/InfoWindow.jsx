import { X } from 'lucide-react'
import StoreDetail from './StoreDetail'

export default function InfoWindow({ store, onClose }) {
  if (!store) return null

  return (
    <div className="absolute top-28 left-4 z-20 w-80 bg-white rounded-2xl shadow-lg p-5 max-h-[calc(100dvh-8rem)] overflow-y-auto">
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
