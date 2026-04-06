import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

const LEGENDS = [
  { color: '#2D7FF9', bg: '#E8F3FF', label: '원활',     desc: '1주일 이내 입고' },
  { color: '#FFAD00', bg: '#FFF8E7', label: '보통',     desc: '2주일 이내 입고' },
  { color: '#F04452', bg: '#FFEEF0', label: '부족',     desc: '15일 이상 경과' },
  { color: '#8B95A1', bg: '#F2F4F6', label: '확인 필요', desc: '3개월 이상 경과' },
]

const TrashBagSVG = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 40 40" className="shrink-0 drop-shadow-sm" aria-hidden="true">
    <ellipse cx="20" cy="35" rx="14" ry="2.5" fill="rgba(0,0,0,0.15)"/>
    <path d="M15 16 C10 8 13 4 16 4 C18 4 19 10 18 14" fill={color} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 16 C30 8 27 4 24 4 C22 4 21 10 22 14" fill={color} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 14 Q20 15 25 14 C29 14 35 22 35 29 C35 35 28 36 20 36 C12 36 5 35 5 29 C5 22 11 14 15 14 Z" fill={color} stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M14 15 Q20 18 26 15 L24 17 Q20 20 16 17 Z" fill="rgba(0,0,0,0.15)"/>
    <path d="M12 21 Q10 26 12 32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M28 21 Q30 26 28 32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
)

function LegendPanel({ latestDate, onClose }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-[15rem]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-[#191F28]">입고 상태 안내</p>
        {onClose && (
          <button onClick={onClose} aria-label="닫기" className="md:hidden">
            <X className="w-4 h-4 text-[#8B95A1]" />
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {LEGENDS.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <TrashBagSVG color={l.color} />
            <span
              className="text-[12px] font-medium px-1.5 py-0.5 rounded-md shrink-0"
              style={{ color: l.color, background: l.bg }}
            >
              {l.label}
            </span>
            <span className="text-[12px] text-[#8B95A1] whitespace-nowrap">{l.desc}</span>
          </li>
        ))}
      </ul>
      {latestDate && (
        <p className="text-[11px] text-[#8B95A1] mt-3 pt-3 border-t border-[#F2F4F6]">
          {latestDate}
        </p>
      )}
    </div>
  )
}

export default function StatusLegend({ latestDate }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute bottom-6 left-4 z-10">
      {/* 모바일: 패널은 absolute로 버튼 위에 띄움, 버튼 위치 불변 */}
      <div className="md:hidden relative">
        {open && (
          <div className="absolute bottom-full left-0 mb-2">
            <LegendPanel latestDate={latestDate} onClose={() => setOpen(false)} />
          </div>
        )}
        <button
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center"
          aria-label="입고 상태 안내"
          aria-expanded={open}
        >
          <HelpCircle className="w-5 h-5 text-[#4E5968]" aria-hidden="true" />
        </button>
      </div>
      {/* 데스크톱: 항상 표시 */}
      <div className="hidden md:block">
        <LegendPanel latestDate={latestDate} />
      </div>
    </div>
  )
}
