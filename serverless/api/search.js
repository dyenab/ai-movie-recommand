export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST method allowed" });
  }
  
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { query, genreId } = req.body;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB API Key is missing." });
  }

  let url = "";
  if (query) {
    // 제목 검색
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}&language=ko`;
  } else if (genreId) {
    // 장르 필터 (Discover API 사용)
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=ko&sort_by=popularity.desc`;
  } else {
    return res.status(400).json({ error: "query 또는 genreId 중 하나가 필요합니다." });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json({ results: data.results || [] });
  } catch (error) {
    console.error("TMDB fetch error:", error);
    res.status(500).json({ error: "TMDB 요청 실패", detail: error.message });
  }
}
