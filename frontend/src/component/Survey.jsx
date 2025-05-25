import { useState } from "react";
import "./Survey.css";
import useResultStore from "../store/useResultStore";
import { useNavigate } from "react-router-dom";

export default function SurveyModal({ onClose }) {
  const [showButton, setShowButton] = useState(false);
  const setAiResponse = useResultStore((state) => state.setAiResponse);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const genres = formData.getAll("genre");
    const weather = formData.getAll("weather");
    const season = formData.getAll("season");

    if (genres.length === 0) {
      alert("장르를 하나 이상 선택해주세요.");
      return;
    }

    try {
      const res = await fetch("https://ai-movie-recommand.vercel.app/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres, weather, season }),
      });

      const data = await res.json();
      console.log("서버 응답 결과:", data);
      setAiResponse(data.movies);
      setShowButton(true);
    } catch (err) {
      console.error("OpenAI 오류:", err);
    }
  };

  return (
    <div className="modal">
      <h2>좋아하는 걸 골라봐! AI가 추천해줄 거야 😎</h2>
      <form onSubmit={handleSubmit}>
        <br />
        <label>좋아하는 장르는?</label><br />
        {["액션", "코미디", "SF", "공포", "로맨스", "판타지", "범죄", "스릴러", "전쟁"].map((genre) => (
          <label key={genre}>
            <input type="checkbox" name="genre" value={genre} /> {genre}
          </label>
        ))}

        <br /><br />
        <label>좋아하는 계절은?</label><br />
        {["봄", "여름", "가을", "겨울"].map((s) => (
          <label key={s}>
            <input type="checkbox" name="season" value={s} /> {s}
          </label>
        ))}

        <br /><br />
        <label>좋아하는 날씨는?</label><br />
        {["맑음", "비", "눈", "흐림"].map((w) => (
          <label key={w}>
            <input type="checkbox" name="weather" value={w} /> {w}
          </label>
        ))}

        <br /><br />
        <p style={{ fontSize: "0.85rem", color: "#777" }}>
          *AI의 추천은 정확하지 않을 수 있습니다
        </p>

        <button type="submit">제출하기</button>
      </form>

      {showButton && (
        <button onClick={() => navigate("/result")}>
          추천 영화 보러가기
        </button>
      )}
      <button onClick={onClose}>닫기</button>
    </div>
  );
}
