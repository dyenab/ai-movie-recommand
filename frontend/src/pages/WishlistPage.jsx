import { useEffect, useState } from "react";
import { getWishlist } from "../utils/WishlistDB";
import MovieDetail from "../component/MovieDetail";
import "./WishlistPage.css";

export default function WishlistPage() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getWishlist().then(setMovies);
  }, []);

  return (
    <div className="wishlist-page">
      <h2 className="wishlist-title">❤️ 내 위시리스트</h2>

      {movies.length > 0 ? (
        <div className="movie-list">
          {movies.map((movie) => (
            <MovieDetail key={movie.id} info={movie} />
          ))}
        </div>
      ) : (
        <p className="empty-msg">아직 위시리스트에 추가된 영화가 없습니다.</p>
      )}
    </div>
  );
}
