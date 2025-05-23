import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SurveyModal from "../component/Survey";
import useResultStore from "../store/useResultStore";
import "./Homepage.css"; // 선택적으로 배경 스타일

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setAiResponse = useResultStore((state) => state.setAiResponse);
  const navigate = useNavigate();

  const handleSurveySubmit = async (genres) => {
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres }),
      });
      const data = await res.json();
      setAiResponse(data.result);         // Zustand에 저장
      setIsModalOpen(false);              // 모달 닫기
      navigate("/result");                // 결과 페이지로 이동
    } catch (error) {
      console.error("AI 추천 실패:", error);
    }
  };

  return (
    <div className="homepage">
      <h1 className="main-title">영화 뭐 볼래? 🧐</h1>

      <button className="open-btn" onClick={() => setIsModalOpen(true)}>
        설문 시작하기
      </button>

      {isModalOpen && (
        <SurveyModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSurveySubmit}
        />
      )}
    </div>
  );
}

