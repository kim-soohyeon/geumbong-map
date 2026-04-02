# 📍 금봉맵 (Geum-Bong Map)
> **금천구 종량제 봉투 & 폐기물 스티커 재고 현황 지도**

금봉맵은 금천구민들이 원하는 규격의 종량제 봉투 판매처를 지도상에서 빠르게 찾고, 최근 입고 데이터를 기반으로 재고 유무를 예측할 수 있도록 돕는 서비스입니다.

## 🌟 주요 특징
- **실시간 위치 기반 검색**: 사용자의 현재 위치 혹은 검색한 주소 주변의 판매소 노출
- **품목별 필터링**: 생활용, 음식물용, 재사용 봉투 및 대형 폐기물 스티커 필터링
- **입고 이력 시각화**: 최근 입고 일자와 수량을 분석하여 재고 상태(원활/확인 필요) 제공
- **0원 유지비 (Serverless)**: Vercel 서버리스 함수를 활용한 CORS-free 아키텍처

## 🏗 System Architecture
본 프로젝트는 **Vercel** 플랫폼을 기반으로 구축되었습니다.

1. **API Proxy**: Vercel Serverless Function(`/api/*`)이 금천구 API를 서버 사이드에서 호출하여 CORS 문제를 해결합니다.
2. **Frontend**: React(Vite) 앱이 Vercel을 통해 서빙되며, `/api/*` 프록시를 통해 실시간 데이터를 fetch하여 지도를 렌더링합니다.
3. **정적 마스터 데이터**: 품목 코드/가격 정보는 `src/data/products.json`에 정적으로 관리합니다.

```
브라우저 (React)
    ↓ fetch /api/stores
Vercel Serverless Function
    ↓ server-side fetch (CORS 없음)
금천구 종량제 API
```

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Kakao Maps SDK
- **Backend**: Vercel Serverless Functions (API Routes)
- **Deployment**: Vercel
- **API**: 금천구 종량제 봉투 관리 시스템 API, Kakao Local API

## 📊 데이터 출처
- **종량제봉투 및 납부필증 판매소 위치검색시스템**: [https://geumcheon.jmtwaste.kr/jmfwaste/webBongtuSeller](https://geumcheon.jmtwaste.kr/jmfwaste/webBongtuSeller)

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# VITE_KAKAO_APP_KEY, KAKAO_REST_API_KEY 입력

# 개발 서버 실행 (Vercel CLI 사용 시 API Route 포함)
npx vercel dev
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Map.jsx              # 카카오 지도 + 마커 렌더링
│   ├── SearchBar.jsx        # 주소 검색 + 반경/품목 필터
│   ├── BottomSheet.jsx      # 모바일 판매소 상세 정보
│   ├── InfoWindow.jsx       # 데스크톱 마커 클릭 팝업
│   └── StatusLegend.jsx     # 마커 색상 범례
├── data/
│   └── products.json        # 품목 마스터 데이터 (정적)
├── hooks/
│   ├── useKakaoMap.js
│   └── useStores.js
└── utils/
    └── statusColor.js       # 입고일 → 색상 변환 로직
api/
├── stores.js                # 판매소 조회 프록시
└── products.js              # 품목 정보 프록시
```
