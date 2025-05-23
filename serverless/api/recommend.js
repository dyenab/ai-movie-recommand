export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const { genres } = req.body;
  if (!genres || !Array.isArray(genres)) {
    return res.status(400).json({ error: "genres가 필요합니다." });
  }

  try {
    const movies = await get3Movies(genres);
    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ error: "추천 실패", detail: error.message });
  }
}

async function get3Movies(genres) {
  const movies = [];
  const seen = new Set();
  let retry = 0;

  while (movies.length < 3 && retry < 5) {
    const titles = await fetchGPT(genres);

    for (const title of titles) {
      const clean = title.replace(/^\d+[\.\)]?\s*/, "").trim();
      if (seen.has(clean)) continue;
      seen.add(clean);

      const info = await fetchTMDB(clean);
      if (info) movies.push(info);
      if (movies.length === 3) break;
    }

    retry++;
  }

  return movies;
}

async function fetchGPT(genres) {
  const prompt = `사용자는 다음 장르의 영화를 좋아합니다: ${genres.join(", ")}.
                  TMDB에 등록된 영화 제목 3가지를 추천해주세요.
                  설명이나 번호 없이 제목만 한 줄에 하나씩 출력해주세요.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "당신은 영화 추천 시스템입니다." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "";
  return raw.split("\n").map(t => t.trim()).filter(Boolean);
}

async function fetchTMDB(title) {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=ko`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results?.[0] || null;
}

