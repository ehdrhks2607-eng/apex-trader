// Vercel 서버리스 함수 — 업비트 API 프록시
// 서버에서 직접 업비트 호출 → CORS 없음 → 빠름

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate=10');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 쿼리 파라미터에서 path 추출
  // 예: /api/upbit?path=/candles/minutes/60&market=KRW-BTC&count=200
  const { path, ...params } = req.query;

  if (!path) {
    res.status(400).json({ error: 'path 파라미터 필요' });
    return;
  }

  // 쿼리스트링 조합
  const qs = new URLSearchParams(params).toString();
  const url = `https://api.upbit.com/v1${path}${qs ? '?' + qs : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'APEX-TRADER/10.0',
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: `업비트 오류: ${response.status}` });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
