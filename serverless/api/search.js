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
  let results = [];
  const randomPage = Math.floor(Math.random() * 10) + 1;

  try {
    if (query) {
      // 제목 검색
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&language=ko`;

    } else if (genreId) {
      // 장르 필터
      let sortParam = "popularity.desc";
      if (sortType === "release_date") {
        sortParam = "release_date.desc";
      } else if (sortType === "random") {
        sortParam = "popularity.desc"; // 랜덤도 우선 인기 기준에서 추출
      }

      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=ko&sort_by=${sortParam}&page=${randomPage}`;
    } else {
      return res.status(400).json({ error: "query 또는 genreId 중 하나가 필요합니다." });
    }

    const response = await fetch(url);
    const data = await response.json();
    results = data.results || [];

    // 랜덤 정렬일 경우 배열을 섞어서 3개만 추출
    if (sortType === "random") {
      results = results.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("TMDB fetch error:", error);
    res.status(500).json({ error: "TMDB 요청 실패", detail: error.message });
  }
}
