# 📑 금봉맵 API 호출 명세서 (API Specification)

본 문서는 '금봉맵' 서비스에서 사용하는 카카오 로컬 API와 금천구 종량제 현황 API의 연동 규격을 정의합니다.

> **CORS 처리 방식**: 금천구 API는 브라우저 직접 호출 시 CORS가 발생합니다.
> 클라이언트는 Vercel Serverless Function(`/api/*`)을 통해 간접 호출하며, 실제 외부 API 호출은 서버 사이드에서 수행됩니다.

---

## 1. 카카오 로컬 (주소 검색) API
사용자가 입력한 도로명 주소를 기반으로 금천구 API 호출에 필요한 위경도(x, y) 좌표를 획득합니다.

> **호출 주체**: 클라이언트 (브라우저 직접 호출 — Kakao가 CORS 허용)

### [기본 정보]
- **Endpoint**: `GET https://dapi.kakao.com/v2/local/search/address.json`
- **Header**:
    - `Authorization`: `KaKaoAK {REST_API_KEY}`

### [요청 파라미터 (Request)]
| 파라미터명 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `query` | String | Y | 검색을 원하는 도로명 주소 |
| `analyze_type` | String | N | 검색 결과 제공 방식 (similar/exact) |

### [주요 응답 데이터 (Response)]
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `documents[0].x` | String | **경도 (Longitude)** -> 금천 API의 `longitude` |
| `documents[0].y` | String | **위도 (Latitude)** -> 금천 API의 `latitude` |
| `documents[0].address_name` | String | 전체 도로명 주소 명칭 |

---

## 2. 금천구 종량제 봉투 판매소 현황 API

> **호출 주체**: Vercel Serverless Function (`/api/stores`) — 서버 사이드 호출

### [기본 정보]
- **Internal Endpoint**: `GET /api/stores` (클라이언트가 호출)
- **Proxy Target**: `GET https://geumcheon.jmtwaste.kr/jmfwaste/part/common/commonCompany/selectValidBongtuSellers`

### [요청 파라미터 (Request)]
| 파라미터명 | 타입 | 필수 | 설명 | 예시 |
| :--- | :--- | :--- | :--- | :--- |
| `latitude` | Double | Y | 검색 중심점 위도 | `37.4568` |
| `longitude` | Double | Y | 검색 중심점 경도 | `126.8954` |
| `radius` | Double | Y | 검색 반경 (km 단위) | `0.4` (400m) |
| `minusMonths` | Integer | Y | 입고 데이터 조회 기간 | `10` |
| `piCode` | String | N | 품목 코드 (선택 안하면 전체) | `102` |

### [주요 응답 데이터 (Response)]
| JSON 경로 | 타입 | 설명 |
| :--- | :--- | :--- |
| `output.object.models[]` | Array | 판매소 정보 목록 |
| `models[].comName` | String | 상호명 (예: 롯데마트 금천점) |
| `models[].address` | String | 도로명 주소 |
| `models[].telNum` | String | 연락처 (02-XXXX-XXXX) |
| `models[].latitude` | Double | 해당 업체 위도 |
| `models[].longitude` | Double | 해당 업체 경도 |
| `models[].pbios[]` | Array | **입고 이력 데이터** |
| `pbios[].piName` | String | 봉투 규격 (예: 20L) |
| `pbios[].pcdName` | String | 봉투 종류 (예: 재사용, 생활용) |
| `pbios[].quantity` | Integer | 입고 수량 (bundle 단위) |
| `pbios[].regDttm` | Long | **입고 일시 (Unix Timestamp, ms)** |

### [Vercel API Route 구현 예시]
```js
// api/stores.js
export default async function handler(req, res) {
  const { latitude, longitude, radius = 0.4, minusMonths = 10, piCode } = req.query;

  const params = new URLSearchParams({ latitude, longitude, radius, minusMonths });
  if (piCode) params.append('piCode', piCode);

  const response = await fetch(
    `https://geumcheon.jmtwaste.kr/jmfwaste/part/common/commonCompany/selectValidBongtuSellers?${params}`
  );
  const data = await response.json();

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(data);
}
```

---

## 3. 금천구 종량제 품목 정보 조회 API

> **호출 주체**: Vercel Serverless Function (`/api/products`) — 서버 사이드 호출, 하루 1회 캐싱

### [기본 정보]
- **Internal Endpoint**: `GET /api/products` (클라이언트가 초기 1회 호출)
- **Proxy Target**: `GET https://geumcheon.jmtwaste.kr/jmfwaste/part/common/productInfo/productInfo/productInfos`

### [주요 응답 데이터 (Response)]
| JSON 경로 | 타입 | 설명 |
| :--- | :--- | :--- |
| `output.object.models[]` | Array | 전체 제품 리스트 |
| `models[].piCode` | String | **제품 고유 코드** (필터링 파라미터로 사용) |
| `models[].piName` | String | 제품 규격 명칭 (예: 5L, 1000원) |
| `models[].pcdName` | String | 제품 종류 (생활용 / 음식물용 / 재사용 / 사업자용 / 특수규격 / 납부필증 / 대형폐기물) |
| `models[].liter` | Integer | 용량 (단위: L) |
| `models[].versionId` | String | 최신 가격 정책 버전 (예: 20250301) |
| `models[].productInfoPricesMap` | Object | **가격 정보** (판매가 및 공급가) |

### [가격 정보 상세 (productInfoPricesMap)]
응답 데이터 중 `priceType: "300"`이 일반 소비자가격(판매가)입니다.
- `priceType: "100"`: 판매소 공급가 (기본)
- `priceType: "200"`: 판매소 공급가 (카드/기타)
- **`priceType: "300"`: 소비자 판매 가격**
- `priceType: "500"`: 제작 단가

### [Vercel API Route 구현 예시]
```js
// api/products.js
export default async function handler(req, res) {
  const response = await fetch(
    'https://geumcheon.jmtwaste.kr/jmfwaste/part/common/productInfo/productInfo/productInfos'
  );
  const data = await response.json();

  // 하루 단위 캐싱 (품목 정보는 자주 변경되지 않음)
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).json(data);
}
```

---

## 4. 품목 마스터 데이터 (금봉맵 필터용 요약)

### 4-1. 봉투 종류별 piCode (핵심 리스트)
| 종류 | 3L | 5L | 10L | 20L | 30L | 50L | 75L | 100L |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **생활용** | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 |
| **음식물** | - | 204 | 205 | - | - | - | - | - |
| **재사용** | - | - | 402 | 401 | - | - | - | - |
| **특수규격**| - | - | 601 | 602 | - | - | - | - |

*(참고: 음식물용 1L=201, 2L=202, 3L=203)*

### 4-2. 납부필증(스티커) 및 기타
- **납부필증**: 10LF(05), 25LF(06), 60LF(07), 120LF(08)
- **대형폐기물**: 1000원(51), 2000원(52), 3000원(53), 4000원(54), 5000원(55), 7000원(56), 9000원(57), 11000원(58), 16000원(59)

---

## 5. 환경변수 정의

| 변수명 | 사용처 | 설명 |
| :--- | :--- | :--- |
| `VITE_KAKAO_APP_KEY` | 클라이언트 | Kakao Maps SDK JavaScript 키 |
| `KAKAO_REST_API_KEY` | 클라이언트 | Kakao Local API REST 키 (주소 → 좌표 변환) |

> `KAKAO_REST_API_KEY`는 클라이언트에서 직접 사용되나 Kakao 도메인 허용 설정으로 보호합니다.
> Vercel 프록시 함수에는 별도 인증키가 필요하지 않습니다 (금천구 API는 공개 API).

---

## 6. 데이터 활용 팁

### 1) 가격 표시 로직
사용자가 지도에서 판매소를 클릭했을 때, 입고된 품목의 가격을 표시하려면 `/api/products` 응답에서 `piCode`를 매칭한 후 `productInfoPricesMap["300"].price` 값을 가져오면 됩니다.

### 2) 제작 중단 품목 처리
`piCode: 108` (생활용 100L)의 경우 이름에 "제작중단"이 포함되어 있습니다. 사용자 UI에서는 노출되더라도 입고 데이터가 없을 확률이 높으므로 예외 처리가 필요합니다.

### 3) 캐싱 전략 요약
| 엔드포인트 | 캐시 TTL | 이유 |
| :--- | :--- | :--- |
| `/api/stores` | 1시간 | 입고 데이터는 수시로 변경 |
| `/api/products` | 24시간 | 품목/가격 정보는 거의 변경 없음 |
