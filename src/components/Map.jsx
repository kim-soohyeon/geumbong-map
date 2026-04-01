import { useEffect, useRef } from 'react'
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

export default function Map({ center, radius, stores, onMarkerClick, isMapLoaded }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const circleRef = useRef(null)

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
        const point = proj.containerPointFromCoords(new kakao.maps.LatLng(store.latitude, store.longitude))
        onMarkerClick(store, { x: point.x, y: point.y })
      })
      markersRef.current.push(marker)
    })
  }, [stores])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
