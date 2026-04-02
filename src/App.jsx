import { useState, useMemo } from 'react'
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
  const [markerPos, setMarkerPos] = useState(null)

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
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#F2F4F6]">
          <p className="text-[15px] text-[#8B95A1]">금천구 지도 펼치는 중...</p>
        </div>
      )}

      {loading && (
        <div className="absolute top-[8.5rem] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white rounded-full px-4 py-2 shadow-md text-[13px] text-[#4E5968]">
            봉투 찾는 중...
          </div>
        </div>
      )}

      {!loading && stores.length === 0 && isLoaded && (
        <div className="absolute top-[8.5rem] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="bg-white rounded-full px-4 py-2 shadow-md text-[13px] text-[#8B95A1]">
            이 근처엔 봉투가 없어요 😢
          </div>
          {radius < 1.0 && (
            <button
              onClick={() => setRadius(radius === 0.4 ? 0.7 : 1.0)}
              className="bg-[#3182F6] text-white text-[13px] font-medium rounded-full px-4 py-2 shadow-md"
            >
              반경 늘리기
            </button>
          )}
        </div>
      )}

      <StatusLegend latestDate={latestDate} />

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
