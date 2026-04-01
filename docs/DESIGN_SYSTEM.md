# 🎨 금봉맵 디자인 시스템 (Geumbong Design System)

본 문서는 토스(Toss)의 'Simplicity' 철학을 계승하여, 사용자가 고민 없이 종량제 봉투 재고를 확인할 수 있도록 하는 금봉이의 UI/UX 원칙을 정의합니다.

---

## 1. 디자인 원칙 (Core Principles)
1. **간결함 (Minimalism)**: 꼭 필요한 정보(위치, 품목, 상태) 외에는 과감히 제거한다.
2. **명확함 (Clarity)**: 전문 용어 대신 사용자에게 익숙한 언어를 사용한다. (예: piCode -> 봉투 크기)
3. **직관적 피드백 (Feedback)**: 입고 상태는 색상과 텍스트로 즉각 인식 가능해야 한다.

---

## 2. 컬러 팔레트 (Color Palette)

토스 특유의 깨끗한 화이트 배경과 포인트 컬러를 사용합니다.

| 용도 | 색상 코드 | 예시 |
| :--- | :--- | :--- |
| **Primary (Point)** | `#3182F6` | 토스 블루 (메인 버튼, 활성화 아이콘) |
| **Background** | `#F2F4F6` | 시스템 배경 (카드 배경) |
| **Surface** | `#FFFFFF` | 카드 내부, 화이트 보드 |
| **Text Primary** | `#191F28` | 강조 텍스트, 제목 |
| **Text Secondary** | `#4E5968` | 보조 설명, 주소 |
| **Status: 원활** | `#2D7FF9` | 1주일 내 입고 (Blue) |
| **Status: 보통** | `#FFAD00` | 2주일 내 입고 (Yellow) |
| **Status: 부족** | `#F04452` | 15일 이상 경과 (Red) |

---

## 3. 타이포그래피 (Typography)

폰트는 시스템 폰트(Pretendard 권장)를 사용하며, 굵기 대비를 통해 정보의 위계를 잡습니다.

- **Title**: `24px / Bold / #191F28` (내 주변 판매처)
- **Subtitle**: `17px / SemiBold / #191F28` (롯데마트 금천점)
- **Body**: `15px / Regular / #4E5968` (서울 금천구 시흥대로...)
- **Caption**: `13px / Medium / #8B95A1` (마지막 입고: 2일 전)

---

## 4. 주요 컴포넌트 가이드

### 4-1. 검색 바 (Search Bar)
- **형태**: 모서리가 둥근 박스 (`border-radius: 12px`)
- **스타일**: 그림자(`box-shadow`)를 약하게 주어 떠 있는 느낌 제공
- **인터랙션**: 클릭 시 주소 검색 창으로 연결

### 4-2. 재고 상태 태그 (Status Tag)
- **디자인**: 텍스트 뒤에 옅은 배경색을 깔아 시인성 확보
- **예**: `원활` (글자색 `#2D7FF9`, 배경색 `#E8F3FF`)

### 4-3. 바텀 시트 (Bottom Sheet)
- **용도**: 모바일 환경에서 판매처 상세 정보 및 입고 내역 표시
- **특징**: 상단을 둥글게 처리하고, 위로 쓸어 올리는 모션 적용

---

## 5. UX 라이팅 (UX Writing)

백엔드 중심의 용어를 사용자 친화적으로 변경합니다.

- `selectValidBongtuSellers` -> **"내 주변 봉투 찾기"**
- `quantity: 15000` -> **"재고 여유"** 또는 **"최근 15,000개 입고"**
- `radius: 0.4km` -> **"내 위치에서 400m"**
- `piCode: 104` -> **"생활용 20L"**

---

## 6. 아이콘 사용 (Iconography)

[Lucide Icons](https://lucide.dev/) 또는 [React Icons]의 가느다란 라인 아이콘을 권장합니다.

- 📍 **위치**: `MapPin`
- 🔍 **검색**: `Search`
- 🛍 **봉투**: `ShoppingBag`
- 📞 **전화**: `Phone`

---

## 💡 개발 팁 (For Soohyeon)

- **Tailwind CSS 활용**:
  ```html
  <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <h3 class="text-[17px] font-semibold text-gray-900">판매소 명칭</h3>
    <p class="text-[15px] text-gray-500">주소 정보</p>
  </div>