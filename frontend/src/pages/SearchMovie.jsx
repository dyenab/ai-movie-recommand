import { useEffect, useState } from "react";
import MovieDetail from "../component/MovieDetail";
import "./SearchMovie.css";

const genreList = [
  { id: 28, name: "액션" },
  { id: 35, name: "코미디" },
  { id: 18, name: "드라마" },
  { id: 10749, name: "로맨스" },
  { id: 27, name: "공포" },
  { id: 878, name: "SF" },
  { id: 12, name: "모험" },
  { id: 53, name: "스릴러" },
  { id: 16, name: "애니메이션" },
  { id: 80, name: "범죄" },
];

export default function SearchMovie() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);

  const fetchMovies = async (body) => {
    try {
      const res = await fetch("https://ai-movie-recommand.vercel.app/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

  const handleSearch = () => {
    if (query.trim() !== "") {
      fetchMovies({ query });
      setActiveGenre(null); // 장르 필터 해제
    }
  };

  const handleGenreClick = (id) => {
    setQuery(""); // 검색어 초기화
    setActiveGenre(id);
    fetchMovies({ genreId: id });
  };

  return (
    <div className="search-page">
      <h2 className="search-title">🔍 영화 검색</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="영화 제목을 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      <div className="genre-buttons">
        {genreList.map((genre) => (
          <button
            key={genre.id}
            className={`genre-btn ${activeGenre === genre.id ? "active" : ""}`}
            onClick={() => handleGenreClick(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div className="movie-list">
        {results.length > 0 ? (
          results.map((movie) => (
            <MovieDetail key={movie.id} info={movie} />
          ))
        ) : (
          <p className="empty-msg">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
