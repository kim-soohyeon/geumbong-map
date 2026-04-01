# 🗺 금봉맵 구현 계획서 (Implementation Plan)

> **배포 전략**: Vercel (Frontend + Serverless API Routes)
> **CORS 해결**: Vercel Serverless Function이 금천구 API를 서버 사이드에서 프록시 호출

---

## Phase 1 — 프로젝트 초기 세팅

### 1-1. 프로젝트 생성 및 패키지 설정

```bash
npm create vite@latest geumbong-map -- --template react
cd geumbong-map
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1-2. 필수 패키지

```bash
npm install lucide-react          # 아이콘 (MapPin, Search, Phone, ShoppingBag)
npm install -D vercel              # 로컬 개발 서버 (API Route 포함)
```

### 1-3. 환경변수 설정

```
# .env.local
VITE_KAKAO_APP_KEY=<JavaScript 키>
VITE_KAKAO_REST_API_KEY=<REST API 키>
```

> Vercel 배포 시 동일한 변수를 Vercel Dashboard > Settings > Environment Variables에 등록

### 1-4. Tailwind CSS 설정

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3182F6',
        'text-primary': '#191F28',
        'text-secondary': '#4E5968',
        'status-good': '#2D7FF9',
        'status-normal': '#FFAD00',
        'status-low': '#F04452',
        'status-unknown': '#8B95A1',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### 1-5. 로컬 개발 서버

```bash
npx vercel dev   # API Route + 프론트엔드 통합 실행 (port 3000)
```

---

## Phase 2 — Vercel API Routes (프록시)

### 2-1. 판매소 조회 프록시

```js
// api/stores.js
export default async function handler(req, res) {
  const { latitude, longitude, radius = 0.4, minusMonths = 10, piCode } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude, longitude는 필수입니다.' });
  }

  const params = new URLSearchParams({ latitude, longitude, radius, minusMonths });
  if (piCode) params.append('piCode', piCode);

  const upstream = await fetch(
    `https://geumcheon.jmtwaste.kr/jmfwaste/part/common/commonCompany/selectValidBongtuSellers?${params}`
  );
  const data = await upstream.json();

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(data);
}
```

### 2-2. 품목 정보 프록시

```js
// api/products.js
export default async function handler(req, res) {
  const upstream = await fetch(
    'https://geumcheon.jmtwaste.kr/jmfwaste/part/common/productInfo/productInfo/productInfos'
  );
  const data = await upstream.json();

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).json(data);
}
```

---

## Phase 3 — 정적 마스터 데이터 구성

`/api/products`를 최초 1회 호출한 결과를 `src/data/products.json`으로 저장합니다.
필터 드롭다운 구성 시 이 파일을 참조하여 네트워크 요청을 줄입니다.

```json
// src/data/products.json (예시 구조)
[
  { "piCode": "102", "piName": "5L", "pcdName": "생활용", "liter": 5, "price": 250 },
  { "piCode": "104", "piName": "20L", "pcdName": "생활용", "liter": 20, "price": 950 },
  ...
]
```

---

## Phase 4 — 핵심 유틸리티

### 4-1. 입고 상태 색상 로직

```js
// src/utils/statusColor.js
export function getStatusColor(pbios) {
  if (!pbios || pbios.length === 0) return { color: '#8B95A1', label: '확인 필요' };

  const latest = Math.max(...pbios.map(p => p.regDttm));
  const daysSince = (Date.now() - latest) / (1000 * 60 * 60 * 24);

  if (daysSince <= 7)  return { color: '#2D7FF9', label: '원활' };
  if (daysSince <= 14) return { color: '#FFAD00', label: '보통' };
  if (daysSince <= 90) return { color: '#F04452', label: '부족' };
  return { color: '#8B95A1', label: '확인 필요' };
}
```

### 4-2. 날짜 포맷 유틸

```js
// src/utils/formatDate.js
export function formatRelativeDate(timestampMs) {
  const days = Math.floor((Date.now() - timestampMs) / (1000 * 60 * 60 * 24));
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7)  return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}
```

---

## Phase 5 — 컴포넌트 구현

### 5-1. 컴포넌트 구조 및 역할

```
App.jsx
├── SearchBar.jsx       — 주소 입력 + 반경 + 품목 필터
├── Map.jsx             — 카카오 지도 + 마커 렌더링
│   └── StatusLegend.jsx  — 좌하단 색상 범례
├── InfoWindow.jsx      — 데스크톱: 마커 클릭 팝업
└── BottomSheet.jsx     — 모바일: 판매소 상세 슬라이드
```

### 5-2. App.jsx 상태 설계

```js
// 핵심 상태
const [center, setCenter]         = useState({ lat: 37.4568, lng: 126.8954 }); // 금천구 중심
const [radius, setRadius]         = useState(0.4);     // km
const [piCode, setPiCode]         = useState('');      // '' = 전체
const [stores, setStores]         = useState([]);
const [selected, setSelected]     = useState(null);    // 선택된 판매소
const [loading, setLoading]       = useState(false);
```

### 5-3. SearchBar.jsx

- 카카오 로컬 API (REST)로 주소 → 좌표 변환
- 변환된 좌표로 `center` 상태 업데이트 → 지도 이동 + 판매소 재조회

```js
async function handleSearch(address) {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    { headers: { Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}` } }
  );
  const { documents } = await res.json();
  if (documents.length > 0) {
    setCenter({ lat: parseFloat(documents[0].y), lng: parseFloat(documents[0].x) });
  }
}
```

### 5-4. Map.jsx

```jsx
// 카카오 지도 초기화 (useEffect)
useEffect(() => {
  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_APP_KEY}&autoload=false`;
  script.onload = () => window.kakao.maps.load(initMap);
  document.head.appendChild(script);
}, []);

// center 또는 stores 변경 시 마커 재렌더링
// 마커 색상은 getStatusColor(store.pbios) 로 결정
```

### 5-5. BottomSheet.jsx (모바일)

- 기본: 화면 하단 고정 (일부만 노출)
- 판매소 선택 시: 위로 슬라이드 (Tailwind `translate-y` 트랜지션)
- 표시 내용: 상호명, 주소, 전화번호, 입고 이력 테이블

---

## Phase 6 — 데이터 페칭 훅

### useStores.js

```js
export function useStores(center, radius, piCode) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!center) return;
    setLoading(true);

    const params = new URLSearchParams({
      latitude: center.lat,
      longitude: center.lng,
      radius,
      minusMonths: 10,
    });
    if (piCode) params.append('piCode', piCode);

    fetch(`/api/stores?${params}`)
      .then(r => r.json())
      .then(data => setStores(data.output?.object?.models ?? []))
      .finally(() => setLoading(false));
  }, [center, radius, piCode]);

  return { stores, loading };
}
```

---

## Phase 7 — Vercel 배포

### 7-1. vercel.json 설정

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

### 7-2. 배포 절차

```bash
# Vercel CLI 설치
npm install -g vercel

# 최초 배포 (프로젝트 연결)
vercel

# 이후 배포
vercel --prod
```

### 7-3. 환경변수 등록

Vercel Dashboard > 프로젝트 > Settings > Environment Variables:

| 변수명 | 값 | 환경 |
| :--- | :--- | :--- |
| `VITE_KAKAO_APP_KEY` | JavaScript 키 | Production, Preview |
| `VITE_KAKAO_REST_API_KEY` | REST API 키 | Production, Preview |

---

## 개발 순서 요약

| 순서 | 작업 | 산출물 |
| :--- | :--- | :--- |
| 1 | Vite + Tailwind + Vercel CLI 세팅 | 로컬 개발 환경 |
| 2 | `api/stores.js`, `api/products.js` 구현 | CORS 해결된 프록시 |
| 3 | `src/data/products.json` 생성 | 정적 품목 마스터 |
| 4 | `utils/statusColor.js`, `utils/formatDate.js` | 색상/날짜 유틸 |
| 5 | `Map.jsx` — 지도 초기화 + 마커 렌더링 | 기본 지도 동작 |
| 6 | `SearchBar.jsx` — 주소 검색 + 필터 | 검색 기능 |
| 7 | `InfoWindow.jsx` / `BottomSheet.jsx` | 판매소 상세 UI |
| 8 | `StatusLegend.jsx` — 색상 범례 | 범례 팝업 |
| 9 | 디자인 시스템 적용 (Toss 스타일) | 최종 UI |
| 10 | Vercel 배포 + 환경변수 등록 | 프로덕션 서비스 |

---

## 주요 고려사항

| 항목 | 내용 |
| :--- | :--- |
| **Kakao 앱키 도메인 제한** | Kakao Developers에서 서비스 도메인(`*.vercel.app`)을 허용 도메인에 등록 필요 |
| **piCode: 108 예외 처리** | 생활용 100L는 제작 중단 — 드롭다운 노출 시 "(제작 중단)" 표기 |
| **모바일 우선 설계** | BottomSheet가 주 인터랙션 레이어, InfoWindow는 md 이상 화면에만 노출 |
| **캐싱 전략** | `/api/stores` 1시간, `/api/products` 24시간 — Vercel Edge Cache 활용 |
| **로딩 상태** | 마커 렌더링 전 스켈레톤 또는 스피너 표시 |
