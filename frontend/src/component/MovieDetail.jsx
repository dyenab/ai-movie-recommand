// /component/MovieDetail.jsx
import "./MovieDetail.css";

export default function MovieDetail({ info }) {
  return (
    <div className="movie-card">
      <img
        src={`https://image.tmdb.org/t/p/w300${info.poster_path}`}
        alt={info.title}
        className="movie-poster"
      />
      <div className="movie-content">
        <h3 className="movie-title">{info.title}</h3>
        <p className="movie-overview">
          {info.overview || "설명이 등록되지 않았습니다."}
        </p>
        <p className="movie-meta">
          ⭐ {info.vote_average} / 10<br />
          📅 {info.release_date}
        </p>
      </div>
    </div>
  );
}

