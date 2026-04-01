/**
 * 판매소의 pbios(입고 이력) 배열을 분석하여 마커 색상과 상태 레이블을 반환합니다.
 *
 * @param {Array} pbios - 입고 이력 배열 (pbios[].regDttm: Unix timestamp ms)
 * @returns {{ color: string, label: string, bgColor: string }}
 */
export function getStatusColor(pbios) {
  if (!pbios || pbios.length === 0) {
    return { color: '#8B95A1', label: '확인 필요', bgColor: '#F2F4F6' };
  }

  const latest = Math.max(...pbios.map((p) => p.regDttm));
  const daysSince = (Date.now() - latest) / (1000 * 60 * 60 * 24);

  if (daysSince <= 7)  return { color: '#2D7FF9', label: '원활',    bgColor: '#E8F3FF' };
  if (daysSince <= 14) return { color: '#FFAD00', label: '보통',    bgColor: '#FFF8E7' };
  if (daysSince <= 90) return { color: '#F04452', label: '부족',    bgColor: '#FFEEF0' };
  return                      { color: '#8B95A1', label: '확인 필요', bgColor: '#F2F4F6' };
}
