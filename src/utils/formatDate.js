/**
 * Unix timestamp(ms)를 상대적 날짜 문자열로 변환합니다.
 * 예: 0일 -> "오늘", 1일 -> "어제", 5일 -> "5일 전"
 *
 * @param {number} timestampMs
 * @returns {string}
 */
export function formatRelativeDate(timestampMs) {
  const days = Math.floor((Date.now() - timestampMs) / (1000 * 60 * 60 * 24));
  if (days === 0)  return '오늘';
  if (days === 1)  return '어제';
  if (days < 7)    return `${days}일 전`;
  if (days < 30)   return `${Math.floor(days / 7)}주 전`;
  if (days < 365)  return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

/**
 * Unix timestamp(ms)를 YYYY.MM.DD 형식으로 변환합니다.
 *
 * @param {number} timestampMs
 * @returns {string}
 */
export function formatDate(timestampMs) {
  const d = new Date(timestampMs);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
