/**
 * Vercel Serverless Function — 판매소 조회 프록시
 * 금천구 selectValidBongtuSellers API를 서버 사이드에서 호출하여 CORS 문제를 해결합니다.
 *
 * GET /api/stores?latitude=&longitude=&radius=&minusMonths=&piCode=
 */

const UPSTREAM =
  'https://geumcheon.jmtwaste.kr/jmfwaste/part/common/commonCompany/selectValidBongtuSellers';

export default async function handler(req, res) {
  const { latitude, longitude, radius = '0.4', minusMonths = '10', piCode } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude, longitude는 필수 파라미터입니다.' });
  }

  const params = new URLSearchParams({ latitude, longitude, radius, minusMonths });
  if (piCode) params.append('piCode', piCode);

  try {
    const upstream = await fetch(`${UPSTREAM}?${params}`);

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: '금천구 API 호출 실패' });
    }

    const data = await upstream.json();

    // 입고 데이터는 수시로 변경될 수 있으므로 1시간 캐싱
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/stores] upstream fetch error:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
