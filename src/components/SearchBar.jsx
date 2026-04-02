import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import allProducts from '../data/products.json'
import { getStatusColor } from '../utils/statusColor'

const TrashBagSVG = ({ color, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 40 40" className={`shrink-0 drop-shadow-sm ${className}`}>
    <ellipse cx="20" cy="35" rx="14" ry="2.5" fill="rgba(0,0,0,0.15)"/>
    <path d="M15 16 C10 8 13 4 16 4 C18 4 19 10 18 14" fill={color} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 16 C30 8 27 4 24 4 C22 4 21 10 22 14" fill={color} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 14 Q20 15 25 14 C29 14 35 22 35 29 C35 35 28 36 20 36 C12 36 5 35 5 29 C5 22 11 14 15 14 Z" fill={color} stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M14 15 Q20 18 26 15 L24 17 Q20 20 16 17 Z" fill="rgba(0,0,0,0.15)"/>
    <path d="M12 21 Q10 26 12 32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M28 21 Q30 26 28 32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
)

const RADIUS_OPTIONS = [
  { label: '400m', value: 0.4 },
  { label: '700m', value: 0.7 },
  { label: '1km',  value: 1.0 },
]

const PRODUCT_OPTIONS = [
  { label: '전체 품목', value: '' },
  ...allProducts
    .filter((p) => !p.piName?.includes('제작중단'))
    .map((p) => ({ label: `${p.pcdName} ${p.piName}`, value: p.piCode })),
]

export default function SearchBar({ radius, piCode, onSearch, onRadiusChange, onPiCodeChange, stores = [], loading = false }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setNotFound(false)
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
        { headers: { Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}` } }
      )
      const { documents } = await res.json()
      if (documents?.length > 0) {
        onSearch({ lat: parseFloat(documents[0].y), lng: parseFloat(documents[0].x) })
      } else {
        setNotFound(true)
      }
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="absolute top-4 left-0 right-0 z-10 px-4">
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-md p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 px-1 pb-2">
          {/* 종량제 봉투 아이콘 & 무한 바운스 애니메이션 */}
          <div className="animate-bounce">
            <TrashBagSVG color="#3182F6" className="w-[18px] h-[18px]" />
          </div>
          <h1 className="text-[14px] md:text-[15px] font-extrabold text-[#191F28] tracking-tight">
            금천봉투맵
          </h1>
        </div>
        <label htmlFor="address-input" className="sr-only">주소 검색</label>
        <div className="flex items-center gap-2 bg-[#F2F4F6] rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-[#8B95A1] shrink-0" />
          <input
            id="address-input"
            type="text"
            placeholder="금천구 도로명 주소를 입력하세요."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setNotFound(false) }}
            className="flex-1 bg-transparent text-[15px] text-[#191F28] placeholder-[#8B95A1] outline-none"
          />
          <button type="submit" disabled={searching} aria-label="검색">
            <Search className={`w-4 h-4 ${searching ? 'text-[#8B95A1]' : 'text-[#3182F6]'}`} />
          </button>
        </div>
        {notFound && (
          <p className="text-[12px] text-[#F04452] px-1">주소를 찾을 수 없습니다.</p>
        )}
        <div className="flex gap-2">
          <div className="flex gap-0.5 bg-[#F2F4F6] rounded-xl p-1">
            {RADIUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => onRadiusChange(o.value)}
                className={`flex-1 text-[13px] font-medium rounded-lg py-1.5 transition-colors ${
                  radius === o.value
                    ? 'bg-white text-[#191F28] shadow-sm'
                    : 'text-[#8B95A1]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <select
              aria-label="품목 선택"
              value={piCode}
              onChange={(e) => onPiCodeChange(e.target.value)}
              className="w-full bg-[#F2F4F6] text-[13px] text-[#191F28] rounded-xl px-3 py-2 outline-none appearance-none pr-7"
            >
              {PRODUCT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B95A1] pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {!loading && stores.length > 0 && (() => {
          const counts = { '원활': 0, '보통': 0, '부족': 0, '확인 필요': 0 }
          stores.forEach((s) => { counts[getStatusColor(s.pbios).label]++ })
          return (
            <div className="flex items-center gap-1.5 px-1 flex-wrap">
              <span className="text-[12px] text-[#4E5968]">이 근처 {stores.length}개 판매소</span>
              <span className="text-[#E5E8EB]">·</span>
              {counts['원활'] > 0 && <span className="text-[12px] font-medium text-[#2D7FF9]">원활 {counts['원활']}</span>}
              {counts['보통'] > 0 && <span className="text-[12px] font-medium text-[#FFAD00]">보통 {counts['보통']}</span>}
              {counts['부족'] > 0 && <span className="text-[12px] font-medium text-[#F04452]">부족 {counts['부족']}</span>}
              {counts['확인 필요'] > 0 && <span className="text-[12px] font-medium text-[#8B95A1]">확인필요 {counts['확인 필요']}</span>}
            </div>
          )
        })()}
      </form>
    </div>
  )
}
