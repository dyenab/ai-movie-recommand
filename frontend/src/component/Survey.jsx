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
    const weather = formData.get("weather");
    const actor = formData.get("actor");

    if (genres.length === 0) {
      alert("장르를 하나 이상 선택해주세요.");
      return;
    }

    try {
      const res = await fetch("https://ai-movie-recommand.vercel.app/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres, weather, actor }),
      });

      const data = await res.json();
      console.log("서버 응답 결과:", data);
      setAiResponse(data.movies); // Zustand에 저장
      setShowButton(true); // 버튼 보이기
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

        <br />
        <label>
          좋아하는 계절은?
          <select name="season">
            <option value="">선택 안함</option>
            <option value="봄">봄</option>
            <option value="여름">여름</option>
            <option value="가을">가을</option>
            <option value="겨울">겨울</option>
          </select>
        </label>

        <br />
        <label>
          좋아하는 날씨는?
          <select name="weather">
            <option value="">선택 안함</option>
            <option value="맑음">맑음</option>
            <option value="비">비</option>
            <option value="눈">눈</option>
            <option value="흐림">흐림</option>
          </select>
        </label>

        <br />
        <label>
          좋아하는 배우는?
          <input type="text" name="actor" placeholder="배우 이름을 입력하세요" />
        </label>

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

