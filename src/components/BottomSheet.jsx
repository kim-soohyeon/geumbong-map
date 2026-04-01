import { X } from 'lucide-react'
import StoreDetail from './StoreDetail'

export default function BottomSheet({ store, onClose }) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-out ${
        store ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8 max-h-[65dvh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#E5E8EB] rounded-full mx-auto mb-4" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-[#F2F4F6]"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-[#4E5968]" />
        </button>
        <StoreDetail store={store} />
      </div>
    </div>
  )
}
