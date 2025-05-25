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

  const { query, genreId, sortType = "popularity" } = req.body;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB API Key is missing." });
  }

  let url = "";
  let results = [];
  const randomPage = Math.floor(Math.random() * 10) + 1;

  try {
    if (query) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=ko`;
    } else if (genreId) {
      let sortParam = "popularity.desc";
      if (sortType === "release_date") {
        sortParam = "release_date.desc";
      } else if (sortType === "vote") {
        sortParam = "vote_average.desc";
      }

      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=ko&sort_by=${sortParam}&page=${randomPage}`;
    } else {
      return res.status(400).json({ error: "query 또는 genreId 중 하나가 필요합니다." });
    }

    const response = await fetch(url);
    const data = await response.json();
    results = data.results || [];

    if (sortType === "random") {
      results = results.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("TMDB fetch error:", error);
    res.status(500).json({ error: "TMDB 요청 실패", detail: error.message });
  }
}
