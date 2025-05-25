import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SurveyModal from "../component/Survey";
import WishlistPage from "./WishlistPage";
import SearchMovie from "./SearchMovie";
import useResultStore from "../store/useResultStore";
import "./Homepage.css";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const movieList = useResultStore((state) => state.aiResponse);
  const navigate = useNavigate();

  const renderContent = () => {
    if (isModalOpen) {
      return (
        <SurveyModal
          onClose={() => setIsModalOpen(false)}
          onDone={() => {
            setIsModalOpen(false);
            navigate("/result");
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
          <div className="message-section">
            <img
              src="/message.jpg"
              alt="message"
              className="message-image"
            />
            <button className="open-btn" onClick={() => setIsModalOpen(true)}>
              추천 받으러 가기
            </button>
            {movieList.length > 0 && (
              <button
                className="open-btn"
                style={{ marginTop: "20px" }}
                onClick={() => navigate("/result")}
              >
                지난 추천 결과 보기
              </button>
            )}
          </div>
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
          ❤️ 위시리스트
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
