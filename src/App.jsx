import { useState } from 'react'
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
