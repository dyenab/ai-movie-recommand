import useResultStore from "../store/useResultStore";
import MovieDetail from "../component/MovieDetail";

export default function ResultPage() {
  const movieList = useResultStore((state) => state.aiResponse);

  return (
    <div>
      <h2>🎬 추천한 영화 3편</h2>
      {movieList && movieList.length > 0 ? (
        movieList.map((movie, idx) => (
          <MovieDetail key={idx} info={movie} />
        ))
      ) : (
        <p>추천된 영화가 없습니다.</p>
      )}
    </div>
  );
}

