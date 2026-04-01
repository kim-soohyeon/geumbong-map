# 📍 금천구 종량제 봉투 판매소 검색 서비스 분석 보고서

본 문서는 금천구 종량제 봉투 및 납부필증 판매소 위치 검색 서비스의 소스 코드 분석을 바탕으로 한 서비스 요약 및 기술 명세입니다.

---

## 1. 서비스 주요 기능

### 🛰 위치 기반 판매소 검색
- **Kakao Map API**를 연동하여 사용자의 현재 위치 또는 특정 주소 주변의 판매소를 지도상에 표시합니다.
- 주소 검색 기능을 통해 금천구 내 원하는 지역의 판매처를 즉시 확인할 수 있습니다.

### 📏 반경 설정 및 필터링
- 검색 중심점으로부터 **400m, 700m, 1,000m** 반경을 선택하여 조회 범위를 조절할 수 있습니다.

### 🛍 품목별 상세 필터링
- 다양한 품목군에 대한 필터 기능을 제공합니다.
    - **생활용**: 3L ~ 75L
    - **음식물용**: 1L ~ 10L
    - **기타**: 재사용 봉투, 대형 폐기물 스티커 등
- 특정 품목 선택 시 해당 제품을 취급하는 판매소만 선별하여 노출합니다.

### 📊 실시간 입고 상태 시각화 (Color Coding)
판매소의 최근 입고 이력을 분석하여 마커 색상을 통해 재고 상태를 직관적으로 제공합니다.
- 🔵 **파란색**: 1주일 이내 입고 (공급 원활)
- 🟡 **노란색**: 2주일 이내 입고
- 🔴 **빨간색**: 15일 ~ 3개월 이내 입고
- ⚪ **회색**: 최근 3개월 내 입고 내역 없음 (확인 필요)

---

## 2. 기술 스택 및 아키텍처

| 구분 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | **React.js (Vite)** | 컴포넌트 기반 UI 라이브러리 활용 |
| **Styling** | **Tailwind CSS** | 유틸리티 클래스 기반 스타일링 |
| **Map API** | **Kakao Maps SDK** | 지도 렌더링, 마커 클러스터링, Geocoder(주소 변환) 활용 |
| **Backend** | **Vercel Serverless Functions** | 금천구 API CORS 우회 프록시 처리 |
| **Deployment** | **Vercel** | 프론트엔드 + API Route 통합 배포 |
| **Data Fetching** | **Native Fetch API** | `/api/*` 프록시 엔드포인트를 통한 데이터 통신 |

### 아키텍처 흐름

```
브라우저 (React + Kakao Maps SDK)
    │
    ├─ fetch /api/stores?lat=...&lng=...&radius=...
    │       ↓
    │   Vercel Serverless Function
    │       ↓ server-side fetch (CORS 없음)
    │   금천구 selectValidBongtuSellers API
    │
    ├─ fetch /api/products  (초기 1회)
    │       ↓
    │   Vercel Serverless Function
    │       ↓
    │   금천구 productInfos API
    │
    └─ Kakao Local API (클라이언트 직접 호출, REST Key)
```

---

## 3. 주요 API 엔드포인트 및 데이터 흐름

### 🏢 판매소 정보 조회 (프록시 경유)
- **Internal Endpoint**: `GET /api/stores`
- **→ 실제 호출**: `selectValidBongtuSellers`
- **Parameters**: `latitude`, `longitude`, `radius`, `minusMonths`, `piCode`
- **Description**: 좌표와 반경을 기준으로 유효한 판매점 목록과 입고 이력을 가져옵니다.

### ⚙️ 서비스 초기화 데이터 (프록시 경유)
- **Internal Endpoint**: `GET /api/products`
- **→ 실제 호출**: `productInfos`
- **Description**: 드롭다운 메뉴에 표시될 전체 제품군 리스트와 가격 정보를 가져옵니다.
- **캐싱 전략**: `Cache-Control: s-maxage=86400` (하루 1회 갱신)

### 🔍 주소 및 좌표 변환 (클라이언트 직접 호출)
- **Kakao Local API**: 사용자가 입력한 도로명 주소를 위경도 좌표로 변환합니다.
- URL: `https://dapi.kakao.com/v2/local/search/address.json`
- **CORS 없음** (Kakao가 허용)

---

## 4. UI 구성 요소 (Interface)

1. **헤더 (Header)**: 서비스 명칭("금천구 종량제봉투 및 납부필증 판매소 위치검색") 및 지자체 로고 표시.
2. **검색 바 (Search Bar)**:
    - 주소 입력 필드
    - 반경 선택 드롭다운 (400m/700m/1000m)
    - 품목 선택 드롭다운 (규격별 선택)
3. **상세 정보창 (InfoWindow / BottomSheet)**:
    - 마커 클릭 시 팝업 노출 (데스크톱) / 바텀 시트 (모바일)
    - 상호명, 주소, 전화번호(클릭 시 연결)
    - **입고 테이블**: 최근 입고된 품목 이름, 수량, 일자를 리스트 형태로 제공
4. **상태 안내 (Legend)**: 지도 좌측 하단의 '?' 버튼을 통해 마커 색상 기준 안내 팝업 제공

---

## 🎯 서비스 목적
이 서비스는 금천구민이 종량제 봉투를 구매하기 위해 여러 판매처를 직접 방문해야 하는 번거로움을 해소하기 위해 제작되었습니다. **데이터 기반의 실시간 입고 현황**을 시각적으로 제공함으로써 주민 편의성을 극대화합니다.
