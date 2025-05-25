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

  const { genres, weather, season, actor } = req.body;

  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    return res.status(400).json({ error: "genres는 필수이며 배열이어야 합니다." });
  }

  try {
    const movies = await get3Movies({ genres, weather, season, actor });
    res.status(200).json({ movies });
  } catch (error) {
    console.error("❌ 서버 에러:", error);
    res.status(500).json({ error: "추천 실패", detail: error.message });
  }
}

async function get3Movies({ genres, weather, season, actor }) {
  console.log("입력된 조건:", { genres, weather, season, actor });

  const movies = [];
  const seen = new Set();
  let retry = 0;

  while (retry < 5) {
    const titles = await fetchGPT({genres, weather, season, actor, isRetry: retry > 0 });
    console.log(`[GPT ${retry + 1}회차 응답]`, titles);

    let addedThisRound = 0;

    for (const title of titles) {
      const clean = title.replace(/^\d+[\.\)]?\s*/, "")
        .normalize("NFKC")
        .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, "")
        .trim();

      if (seen.has(clean)) continue;
      seen.add(clean);

      const info = await fetchTMDB(clean);
      console.log("TMDB 응답:", info);

      if (info) {
        movies.push(info);
        addedThisRound++;
        if (movies.length >= 3) break;
      }
    }

    //아무 영화도 못 받았다면 중단
    if (addedThisRound === 0) break;

    retry++;
  }

  return movies;
}

async function fetchGPT({ genres, weather, season, actor, isRetry = false }) {
  const lines = [
    `장르: ${genres.join(", ")}`,
    weather ? `날씨: ${weather}` : "",
    season ? `계절: ${season}` : "",
    actor ? `배우: ${actor}` : "",
    "",
    isRetry ? "위에 조건을 고려해서 새로운 영화를 다시 추천해주세요" : "",

    "위 조건을 고려해 영어 영화 제목을 최대 3개까지 추천해주세요.",
    "조건에 맞는 영화가 적다면 1~2개만 추천해도 괜찮습니다.",
    "영화 제목은 다음과 같은 형식으로 출력해주세요:",
    "- 위  영화를 추천해주세요",
    "- 영어 제목만 출력해주세요",
    "- 숫자, 괄호, 설명 없이",
    "- 각 제목은 줄바꿈으로만 구분해주세요"
  ];

  const prompt = lines.filter(Boolean).join("\n");

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
  console.log("🧠 GPT 응답:", data);

  const raw = data.choices?.[0]?.message?.content?.trim() || "";
  return raw.split("\n").map(t => t.trim()).filter(Boolean);
}

async function fetchTMDB(title) {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=ko&api_key=${apiKey}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  const data = await res.json();
  return data.results?.[0] || null;
}



