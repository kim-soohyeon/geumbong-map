/**
 * Vercel Serverless Function — 품목 정보 프록시
 * 금천구 productInfos API를 서버 사이드에서 호출합니다.
 * 품목/가격 정보는 자주 변경되지 않으므로 24시간 캐싱합니다.
 *
 * GET /api/products
 */

const UPSTREAM =
  'https://geumcheon.jmtwaste.kr/jmfwaste/part/common/productInfo/productInfo/productInfos';

export default async function handler(req, res) {
  try {
    const upstream = await fetch(UPSTREAM);

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: '금천구 API 호출 실패' });
    }

    const data = await upstream.json();

    // 품목 정보는 거의 변경되지 않으므로 24시간 캐싱
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/products] upstream fetch error:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
