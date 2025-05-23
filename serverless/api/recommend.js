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
    console.error("❌ 서버 에러:", error);
    res.status(500).json({ error: "추천 실패", detail: error.message });
  }
}

async function get3Movies(genres) {
  console.log("장르:", genres);
  const movies = [];
  const seen = new Set();
  let retry = 0;

  while (movies.length < 3 && retry < 5) {
    const titles = await fetchGPT(genres);
    console.log(`[${retry + 1}회차 GPT 응답]`, titles);

    for (const title of titles) {
      console.log("📦 원본 문자열 코드:", [...title].map(c => c.charCodeAt(0)));
      const clean = title.replace(/^\d+[\.\)]?\s*/, "")
                          .normalize("NFKC")
                          .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, "")
                          .trim();

      console.log("검사 중인 제목:", clean);

      if (seen.has(clean)) continue;
      seen.add(clean);

      const info = await fetchTMDB(clean);
      console.log("TMDB 응답:", info);

      if (info) movies.push(info);
      if (movies.length === 3) break;
    }

    retry++;
  }

  return movies;
}

async function fetchGPT(genres) {
  const prompt = `사용자는 다음 장르의 영화를 좋아합니다: ${genres.join(", ")}.
                  이 장르에 해당하는 TMDB 영화 제목 3가지를 추천해주세요.
                  - 매번 다른 영화를 추천해주세요
                  - 영어 제목은 한국어 발음으로 작성해주세요 (ex : La La Land -> 라라랜드)
                  - 제목 외에는 어떤 텍스트도 포함하지 마세요
                  - 숫자, 괄호, 설명 없이 **영화 제목만**
                  - 각 영화 제목은 줄바꿈(enter)으로만 구분
                  `;
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
  console.log("🧠 GPT 원문 응답:", data);
  const raw = data.choices?.[0]?.message?.content?.trim() || "";
  return raw.split("\n").map(t => t.trim()).filter(Boolean);
}

async function fetchTMDB(title) {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=ko`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  const data = await res.json();
  return data.results?.[0] || null;
}


