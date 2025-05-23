import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SurveyModal from "../component/Survey";
import WishlistPage from "./WishlistPage";
import SearchMovie from "./SearchMovie";
import useResultStore from "../store/useResultStore";
import "./Homepage.css";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // 'home', 'wishlist', 'search'
  const movieList = useResultStore((state) => state.aiResponse);
  const navigate = useNavigate();

  const renderContent = () => {
    if (isModalOpen) {
      return (
        <SurveyModal
          onClose={() => setIsModalOpen(false)}
          onDone={() => {
            setIsModalOpen(false);
            navigate("/result"); // ✅ 설문 완료 후 이동
          }}
        />
      );
    }

    switch (activeTab) {
      case "wishlist":
        return <WishlistPage />;
      case "search":
        return <SearchMovie />;
      default:
        return (
          <>
            <h1 className="main-title">영화 뭐 볼래? 🧐</h1>
            <button className="open-btn" onClick={() => setIsModalOpen(true)}>
              설문 시작하기
            </button>
            {movieList.length > 0 && (
              <button
                className="open-btn"
                style={{ marginTop: "20px" }}
                onClick={() => navigate("/result")} // ✅ 지난 추천 보기
              >
                지난 추천 결과 보기
              </button>
            )}
          </>
        );
    }
  };

  return (
    <div className="homepage">
      <div className="menu-tabs">
        <button
          className={`tab-btn ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          🏠 홈
        </button>
        <button
          className={`tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
          onClick={() => setActiveTab("wishlist")}
        >
          💖 위시리스트
        </button>
        <button
          className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          🔍 영화 검색
        </button>
      </div>

      <div className="tab-content">{renderContent()}</div>
    </div>
  );
}
