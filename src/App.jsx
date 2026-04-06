import { useState, useMemo, useRef } from 'react'
import { useKakaoMap } from './hooks/useKakaoMap'
import { useStores } from './hooks/useStores'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import BottomSheet from './components/BottomSheet'
import InfoWindow from './components/InfoWindow'
import StatusLegend from './components/StatusLegend'
import LocationButton from './components/LocationButton'

const DEFAULT_CENTER = { lat: 37.4568, lng: 126.8954 }

export default function App() {
  const mapRef = useRef(null)
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [radius, setRadius] = useState(0.4)
  const [piCode, setPiCode] = useState('')
  const [selected, setSelected] = useState(null)
  const [markerPos, setMarkerPos] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  const { isLoaded } = useKakaoMap()
  const { stores, loading } = useStores(center, radius, piCode)

  const latestDate = useMemo(() => {
    let max = 0
    stores.forEach((s) => s.pbios?.forEach((p) => { if (p.regDttm > max) max = p.regDttm }))
    if (!max) return null
    const d = new Date(max)
    return `${d.getMonth() + 1}월 ${d.getDate()}일 데이터 기준`
  }, [stores])

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>
      <SearchBar
        radius={radius}
        piCode={piCode}
        onSearch={setCenter}
        onRadiusChange={setRadius}
        onPiCodeChange={setPiCode}
        stores={stores}
        loading={loading}
      />

      {isLoaded ? (
        <Map
          ref={mapRef}
          center={center}
          radius={radius}
          stores={stores}
          onMarkerClick={(store, pos) => {
            if (selected?.comName === store.comName) {
              setSelected(null); setMarkerPos(null)
            } else {
              setSelected(store); setMarkerPos(pos)
            }
          }}
          isMapLoaded={isLoaded}
          userLocation={userLocation}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#F2F4F6]">
          <p className="text-[15px] text-[#8B95A1]">금천구 지도 펼치는 중...</p>
        </div>
      )}

      {loading && (
        <div className="absolute top-[8.5rem] left-1/2 -translate-x-1/2 z-10 pointer-events-none" aria-live="polite" aria-atomic="true">
          <div className="bg-white rounded-full px-4 py-2 shadow-md text-[13px] text-[#4E5968]">
            봉투 찾는 중...
          </div>
        </div>
      )}

      {!loading && stores.length === 0 && isLoaded && (
        <div className="absolute top-[8.5rem] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3" aria-live="polite" aria-atomic="true">
          <div className="relative animate-[bounce_2.5s_infinite]">
            <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 40 40" className="drop-shadow-lg opacity-90" aria-hidden="true">
              <ellipse cx="20" cy="35" rx="14" ry="2.5" fill="rgba(0,0,0,0.1)"/>
              <path d="M15 16 C10 8 13 4 16 4 C18 4 19 10 18 14" fill="#8B95A1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M25 16 C30 8 27 4 24 4 C22 4 21 10 22 14" fill="#8B95A1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 14 Q20 15 25 14 C29 14 35 22 35 29 C35 35 28 36 20 36 C12 36 5 35 5 29 C5 22 11 14 15 14 Z" fill="#8B95A1" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M14 15 Q20 18 26 15 L24 17 Q20 20 16 17 Z" fill="rgba(0,0,0,0.15)"/>
              <circle cx="20" cy="27" r="6" fill="#F2F4F6"/>
              {/* 우는 얼굴 (ㅠㅠ) */}
              <text x="20" y="29.5" fontSize="6.5" fontWeight="900" fill="#4E5968" textAnchor="middle" fontFamily="sans-serif">ㅠㅠ</text>
            </svg>
            <span className="absolute top-[38px] left-[15px] text-blue-400 text-[12px] animate-[ping_1.5s_infinite]">💧</span>
            <span className="absolute top-[38px] right-[15px] text-blue-400 text-[12px] animate-[ping_1.5s_infinite_0.75s]">💧</span>
          </div>
          <div className="bg-white rounded-full px-5 py-2.5 shadow-md flex items-center justify-center">
            <p className="text-[14px] font-medium text-[#4E5968]">이 근처엔 봉투가 없어요 😢</p>
          </div>
          {radius < 1.0 && (
            <button
              onClick={() => setRadius(radius === 0.4 ? 0.7 : 1.0)}
              className="bg-[#3182F6] text-white text-[13px] font-medium rounded-full px-5 py-2 shadow-md hover:bg-blue-600 transition-colors"
            >
              반경 늘리기
            </button>
          )}
        </div>
      )}

      <StatusLegend latestDate={latestDate} />

      <div className="absolute bottom-6 right-4 z-10">
        <LocationButton
          onLocate={(pos) => {
            setCenter(pos)
            setUserLocation(pos)
            mapRef.current?.panTo(pos.lat, pos.lng)
          }}
        />
      </div>

      <div className="md:hidden">
        <BottomSheet store={selected} onClose={() => setSelected(null)} />
      </div>

      <div className="hidden md:block">
        <InfoWindow store={selected} position={markerPos} onClose={() => { setSelected(null); setMarkerPos(null) }} />
      </div>

      {/* 데이터 출처 표기 (하단 중앙) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-[10px] md:text-[11px] font-medium text-[#4E5968] bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm pointer-events-none whitespace-nowrap">
        데이터 출처: 폐기물류 종량제 통합 관리 운영시스템
      </div>
    </div>
  )
}
