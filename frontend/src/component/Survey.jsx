import { useState } from "react";
import "./Survey.css";

export default function SurveyModal({ onClose }) {
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const genres = formData.getAll("genre");

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres }),
      });

      const data = await res.json();
      setResult(data.result); // 영화 제목 저장
    } catch (err) {
      console.error("OpenAI 오류:", err);
    }
  };

  return (
    <div className="modal">
      <h2>선호하는 장르는?</h2>
      <form onSubmit={handleSubmit}>
        <label><input type="checkbox" name="genre" value="액션" /> 액션</label><br />
        <label><input type="checkbox" name="genre" value="코미디" /> 코미디</label><br />
        <label><input type="checkbox" name="genre" value="SF" /> SF</label><br />
        <label><input type="checkbox" name="genre" value="공포" /> 공포</label><br />
        <label><input type="checkbox" name="genre" value="로맨스" /> 로맨스</label><br />
        <label><input type="checkbox" name="genre" value="판타지" /> 판타지</label><br />
        <label><input type="checkbox" name="genre" value="범죄" /> 범죄</label><br />
        <label><input type="checkbox" name="genre" value="스릴러" /> 스릴러</label><br />
        <label><input type="checkbox" name="genre" value="전쟁" /> 전쟁</label><br />

        <button type="submit">제출하기</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>🎬 추천 영화:</h3>
          <p>{result}</p>
        </div>
      )}

      <button onClick={onClose}>닫기</button>
    </div>
  );
}

