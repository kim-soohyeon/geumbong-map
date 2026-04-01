import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import allProducts from '../data/products.json'

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

export default function SearchBar({ radius, piCode, onSearch, onRadiusChange, onPiCodeChange }) {
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
        <div className="flex items-center gap-2 bg-[#F2F4F6] rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-[#8B95A1] shrink-0" />
          <input
            type="text"
            placeholder="주소를 입력하세요"
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
          <select
            value={radius}
            onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
            className="bg-[#F2F4F6] text-[13px] text-[#191F28] rounded-xl px-3 py-2 outline-none"
          >
            {RADIUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={piCode}
            onChange={(e) => onPiCodeChange(e.target.value)}
            className="flex-1 bg-[#F2F4F6] text-[13px] text-[#191F28] rounded-xl px-3 py-2 outline-none"
          >
            {PRODUCT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </form>
    </div>
  )
}
