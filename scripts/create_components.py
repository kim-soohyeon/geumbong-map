import os, sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

base = 'C:/IdeaProjects/geumbong-map'
files = {}

files['src/hooks/useKakaoMap.js'] = """import { useState, useEffect } from 'react'

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
"""

files['src/hooks/useStores.js'] = """import { useState, useEffect } from 'react'

export function useStores(center, radius, piCode) {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!center) return
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      latitude: center.lat,
      longitude: center.lng,
      radius,
      minusMonths: 10,
    })
    if (piCode) params.append('piCode', piCode)

    fetch(`/api/stores?${params}`)
      .then((r) => r.json())
      .then((data) => setStores(data.output?.object?.models ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [center, radius, piCode])

  return { stores, loading, error }
}
"""

files['src/components/Map.jsx'] = """import { useEffect, useRef } from 'react'
import { getStatusColor } from '../utils/statusColor'

function createMarkerImage(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <circle cx="11" cy="11" r="8" fill="${color}" stroke="white" stroke-width="2.5"/>
  </svg>`
  return new window.kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    new window.kakao.maps.Size(22, 22),
    { offset: new window.kakao.maps.Point(11, 11) }
  )
}

export default function Map({ center, stores, onMarkerClick, isMapLoaded }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !containerRef.current) return
    const { kakao } = window
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: 4,
    })
  }, [isMapLoaded])

  // 중심점 이동
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(center.lat, center.lng)
    )
  }, [center])

  // 마커 렌더링
  useEffect(() => {
    if (!mapRef.current) return
    const { kakao } = window

    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    stores.forEach((store) => {
      const { color } = getStatusColor(store.pbios)
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(store.latitude, store.longitude),
        image: createMarkerImage(color),
        map: mapRef.current,
      })
      kakao.maps.event.addListener(marker, 'click', () => onMarkerClick(store))
      markersRef.current.push(marker)
    })
  }, [stores])

  return <div ref={containerRef} className="w-full h-full" />
}
"""

files['src/components/SearchBar.jsx'] = """import { useState } from 'react'
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
"""

files['src/components/StoreDetail.jsx'] = """import { Phone } from 'lucide-react'
import { getStatusColor } from '../utils/statusColor'
import { formatRelativeDate } from '../utils/formatDate'

export default function StoreDetail({ store }) {
  if (!store) return null

  const { color, label, bgColor } = getStatusColor(store.pbios)
  const sorted = [...(store.pbios ?? [])].sort((a, b) => b.regDttm - a.regDttm)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span
          className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
          style={{ color, background: bgColor }}
        >
          {label}
        </span>
        <h2 className="text-[17px] font-semibold text-[#191F28] mt-2 leading-snug">
          {store.comName}
        </h2>
        <p className="text-[14px] text-[#4E5968] mt-0.5">{store.address}</p>
      </div>

      {store.telNum && (
        <a
          href={`tel:${store.telNum}`}
          className="flex items-center gap-2 text-[14px] text-[#3182F6] font-medium"
        >
          <Phone className="w-4 h-4" />
          {store.telNum}
        </a>
      )}

      <div>
        <p className="text-[13px] font-semibold text-[#191F28] mb-2">최근 입고 현황</p>
        {sorted.length > 0 ? (
          <div className="flex flex-col">
            {sorted.slice(0, 8).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[13px] py-2 border-b border-[#F2F4F6] last:border-0"
              >
                <span className="text-[#191F28]">
                  {item.pcdName} {item.piName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[#4E5968]">{item.quantity?.toLocaleString()}개</span>
                  <span className="text-[12px] text-[#8B95A1]">
                    {formatRelativeDate(item.regDttm)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#8B95A1]">최근 입고 내역이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
"""

files['src/components/BottomSheet.jsx'] = """import { X } from 'lucide-react'
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
"""

files['src/components/InfoWindow.jsx'] = """import { X } from 'lucide-react'
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
"""

files['src/components/StatusLegend.jsx'] = """import { useState } from 'react'
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
"""

files['src/App.jsx'] = """import { useState } from 'react'
import { useKakaoMap } from './hooks/useKakaoMap'
import { useStores } from './hooks/useStores'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import BottomSheet from './components/BottomSheet'
import InfoWindow from './components/InfoWindow'
import StatusLegend from './components/StatusLegend'

const DEFAULT_CENTER = { lat: 37.4568, lng: 126.8954 }

export default function App() {
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [radius, setRadius] = useState(0.4)
  const [piCode, setPiCode] = useState('')
  const [selected, setSelected] = useState(null)

  const { isLoaded } = useKakaoMap()
  const { stores, loading } = useStores(center, radius, piCode)

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>
      <SearchBar
        radius={radius}
        piCode={piCode}
        onSearch={setCenter}
        onRadiusChange={setRadius}
        onPiCodeChange={setPiCode}
      />

      {isLoaded ? (
        <Map
          center={center}
          stores={stores}
          onMarkerClick={setSelected}
          isMapLoaded={isLoaded}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#F2F4F6]">
          <p className="text-[15px] text-[#8B95A1]">지도를 불러오는 중...</p>
        </div>
      )}

      {loading && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white rounded-full px-4 py-2 shadow-md text-[13px] text-[#4E5968]">
            판매소 검색 중...
          </div>
        </div>
      )}

      <StatusLegend />

      <div className="md:hidden">
        <BottomSheet store={selected} onClose={() => setSelected(null)} />
      </div>

      <div className="hidden md:block">
        <InfoWindow store={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  )
}
"""

for rel_path, content in files.items():
    full_path = os.path.join(base, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK: {rel_path}')

print('done')
