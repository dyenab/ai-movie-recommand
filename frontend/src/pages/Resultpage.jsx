import { useNavigate } from "react-router-dom";
import useResultStore from "../store/useResultStore";
import MovieDetail from "../component/MovieDetail";
import "./Resultpage.css";

export default function ResultPage() {
  const movieList = useResultStore((state) => state.aiResponse);
  const navigate = useNavigate();

  return (
    <div className="result-page">
      <h2 className="result-title">🎬 추천된 영화</h2>

      {movieList.length > 0 ? (
        <div className="movie-list">
          {movieList.map((movie, idx) => (
            <MovieDetail key={idx} info={movie} />
          ))}
        </div>
      ) : (
        <p>추천된 영화가 없습니다.</p>
      )}

      <button className="open-btn" onClick={() => navigate("/")}>
        다시 홈으로
      </button>
    </div>
  );
}


