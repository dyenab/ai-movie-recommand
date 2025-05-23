import "./MovieDetail.css";
import { useEffect, useState } from "react";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../utils/wishlistDB";

export default function MovieDetail({ info }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    isInWishlist(info.id).then(setLiked);
  }, [info.id]);

  const toggleLike = async () => {
    if (liked) {
      await removeFromWishlist(info.id);
    } else {
      await addToWishlist(info);
    }
    setLiked(!liked);
  };

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
        <p className="movie-meta">🔞 성인용: {info.adult ? "⭕️" : "❌"}</p>
      </div>

      <button
        className="like-button"
        onClick={toggleLike}
        title={liked ? "위시리스트에서 제거" : "위시리스트에 추가"}
      >
        {liked ? "❤️" : "🤍"}
      </button>
    </div>
  );
}
