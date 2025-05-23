import { useState } from "react";
import SurveyModal from "../component/Survey";
import "./Homepage.css";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="homepage">
      <h1 className="main-title">영화 뭐 볼래? 🧐</h1>

      <button className="open-btn" onClick={() => setIsModalOpen(true)}>
        설문 시작하기
      </button>

      {isModalOpen && (
        <SurveyModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}


