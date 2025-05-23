// serverless/api/recommend.js
export default async function handler(req, res) {
  // ✅ preflight 요청에 대한 응답
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // ✅ POST 요청만 처리
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  // 🧠 OpenAI 호출 로직 그대로 이어지면 됨
  const { genres } = req.body;
  const prompt = `사용자는 다음 장르의 영화를 좋아합니다: ${genres.join(", ")}. 
영화 제목 하나만 추천해주세요. 설명 없이 제목만 출력해주세요.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    res.status(200).json({ result: reply });
  } catch (error) {
    res.status(500).json({ error: "OpenAI 호출 실패", detail: error.message });
  }
}
