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

  const {
    query,
    genreId,
    sortType = "popularity",
    genres,
    weather,
    season,
  } = req.body;

  const hasQuery = typeof query === "string" && query.trim() !== "";
  const hasGenreId = typeof genreId === "number" && !isNaN(genreId);

  // ✅ TMDB 검색 기능
  if (hasQuery || hasGenreId) {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "TMDB API Key is missing." });
    }

    let url = "";
    let results = [];
    const randomPage = Math.floor(Math.random() * 10) + 1;

    try {
      if (hasQuery) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
          query
        )}&language=ko`;
      } else if (hasGenreId) {
        let sortParam = "popularity.desc";
        if (sortType === "release_date") {
          sortParam = "release_date.desc";
        } else if (sortType === "vote") {
          sortParam = "vote_average.desc";
        }

        url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=ko&sort_by=${sortParam}&page=${randomPage}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      results = data.results || [];

      if (sortType === "random") {
        results = results.sort(() => 0.5 - Math.random()).slice(0, 3);
      }

      return res.status(200).json({ results });
    } catch (error) {
      console.error("TMDB fetch error:", error);
      return res.status(500).json({ error: "TMDB 요청 실패", detail: error.message });
    }
  }

  // ✅ GPT 추천 기능
  if (genres && Array.isArray(genres) && genres.length > 0) {
    try {
      const movies = await get3Movies({ genres, weather, season });
      return res.status(200).json({ movies });
    } catch (error) {
      console.error("❌ 서버 에러:", error);
      return res
        .status(500)
        .json({ error: "추천 실패", detail: error.message });
    }
  }

  // ❌ 그 외에는 잘못된 요청
  return res
    .status(400)
    .json({ error: "query/genreId 또는 genres 중 하나는 반드시 포함되어야 합니다." });
}

// ✅ GPT 추천 관련 함수들 (그대로 유지)

async function get3Movies({ genres, weather, season }) {
  const movies = [];
  const seen = new Set();
  let retry = 0;

  while (retry < 5) {
    const titles = await fetchGPT({ genres, weather, season, isRetry: retry > 0 });

    for (const title of titles) {
      const clean = title
        .replace(/^[\d]+[\.\)]?\s*/, "")
        .normalize("NFKC")
        .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, "")
        .trim();

      if (seen.has(clean)) continue;
      seen.add(clean);

      const info = await fetchTMDB(clean);
      if (info) {
        movies.push(info);
        if (movies.length >= 3) return movies;
      }
    }

    retry++;
  }

  return movies;
}

async function fetchGPT({ genres, weather, season, isRetry = false }) {
  const lines = [
    `장르: ${genres.join(", ")}인 영화`,
    weather ? `날씨: ${weather}에 어울리는 영화` : "",
    season ? `계절: ${season}에 어울리는 영화` : "",
    "",
    isRetry
      ? "※ 이전과 겹치지 않는 새로운 영화를 다시 추천해주세요."
      : "",
    "위 조건을 고려해 영어 영화 제목을 최대 3개까지 추천해주세요.",
    "조건에 맞는 영화가 적다면 1~2개만 추천해도 괜찮습니다.",
    "- 실제 존재하는 영화만 추천해주세요",
    "- 영화 제목만 출력해주세요 (설명, 번호, 기호 없이)",
    "- 각 제목은 줄바꿈으로만 구분해주세요",
  ];

  const prompt = lines.filter(Boolean).join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "당신은 영화 추천 시스템입니다." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "";
  return raw.split("\n").map((t) => t.trim()).filter(Boolean);
}

async function fetchTMDB(title) {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    title
  )}&language=ko&api_key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results?.[0] || null;
}
