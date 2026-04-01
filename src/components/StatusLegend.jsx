import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

const LEGENDS = [
  { color: '#2D7FF9', bg: '#E8F3FF', label: '원활',     desc: '1주일 이내 입고' },
  { color: '#FFAD00', bg: '#FFF8E7', label: '보통',     desc: '2주일 이내 입고' },
  { color: '#F04452', bg: '#FFEEF0', label: '부족',     desc: '15일 이상 경과' },
  { color: '#8B95A1', bg: '#F2F4F6', label: '확인 필요', desc: '3개월 이상 경과' },
]

export default function StatusLegend() {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute bottom-6 left-4 z-10">
      {open ? (
        <div className="bg-white rounded-2xl shadow-md p-4 w-56">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-[#191F28]">입고 상태 안내</span>
            <button onClick={() => setOpen(false)} aria-label="닫기">
              <X className="w-4 h-4 text-[#8B95A1]" />
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {LEGENDS.map((l) => (
              <li key={l.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: l.color, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}
                />
                <span
                  className="text-[12px] font-medium px-1.5 py-0.5 rounded-md"
                  style={{ color: l.color, background: l.bg }}
                >
                  {l.label}
                </span>
                <span className="text-[12px] text-[#8B95A1]">{l.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center"
          aria-label="입고 상태 안내"
        >
          <HelpCircle className="w-5 h-5 text-[#4E5968]" />
        </button>
      )}
    </div>
  )
}
