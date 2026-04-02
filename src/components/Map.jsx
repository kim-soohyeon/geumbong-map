import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { getStatusColor } from '../utils/statusColor'

function createMarkerImage(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <!-- 그림자 -->
    <ellipse cx="20" cy="35" rx="14" ry="2.5" fill="rgba(0,0,0,0.15)"/>

    <!-- 왼쪽 묶은 귀(손잡이) -->
    <path d="M15 16 C10 8 13 4 16 4 C18 4 19 10 18 14" fill="${color}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- 오른쪽 묶은 귀(손잡이) -->
    <path d="M25 16 C30 8 27 4 24 4 C22 4 21 10 22 14" fill="${color}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- 쓰레기봉투 몸통 (밑으로 갈수록 빵빵해지는 형태) -->
    <path d="M15 14 Q20 15 25 14 C29 14 35 22 35 29 C35 35 28 36 20 36 C12 36 5 35 5 29 C5 22 11 14 15 14 Z" fill="${color}" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>

    <!-- 묶인 주름(매듭) 디테일 -->
    <path d="M14 15 Q20 18 26 15 L24 17 Q20 20 16 17 Z" fill="rgba(0,0,0,0.15)"/>

    <path d="M12 21 Q10 26 12 32" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M28 21 Q30 26 28 32" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </svg>`
  return new window.kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    new window.kakao.maps.Size(40, 40),
    { offset: new window.kakao.maps.Point(20, 36) }
  )
}

function createUserLocationImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="6" fill="#3182F6" opacity="0.25">
      <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="12" cy="12" r="6" fill="#3182F6" stroke="white" stroke-width="2.5"/>
  </svg>`
  return new window.kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    new window.kakao.maps.Size(24, 24),
    { offset: new window.kakao.maps.Point(12, 12) }
  )
}

const Map = forwardRef(function Map({ center, radius, stores, onMarkerClick, isMapLoaded, userLocation }, ref) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const circleRef = useRef(null)
  const userMarkerRef = useRef(null)

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !containerRef.current) return
    const { kakao } = window
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: 4,
    })
  }, [isMapLoaded])

  useImperativeHandle(ref, () => ({
    panTo: (lat, lng) => {
      mapRef.current?.panTo(new window.kakao.maps.LatLng(lat, lng))
    }
  }))

  // 내 위치 마커
  useEffect(() => {
    if (!mapRef.current || !userLocation) return
    if (userMarkerRef.current) userMarkerRef.current.setMap(null)
    userMarkerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      image: createUserLocationImage(),
      map: mapRef.current,
      zIndex: 5,
    })
  }, [userLocation])

  // 중심점 이동
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(center.lat, center.lng)
    )
  }, [center])

  // 반경 원 렌더링
  useEffect(() => {
    if (!mapRef.current) return
    if (circleRef.current) circleRef.current.setMap(null)
    circleRef.current = new window.kakao.maps.Circle({
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      radius: radius * 1000,
      strokeWeight: 1.5,
      strokeColor: '#3182F6',
      strokeOpacity: 0.45,
      strokeStyle: 'solid',
      fillColor: '#3182F6',
      fillOpacity: 0.07,
      map: mapRef.current,
    })
  }, [center, radius, isMapLoaded])

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
      kakao.maps.event.addListener(marker, 'click', () => {
        const proj = mapRef.current.getProjection()
        const markerLatLng = new kakao.maps.LatLng(store.latitude, store.longitude)
        const point = proj.containerPointFromCoords(markerLatLng)

        onMarkerClick(store, { x: point.x, y: point.y })
      })
      markersRef.current.push(marker)
    })
  }, [stores, onMarkerClick])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
})

export default Map
