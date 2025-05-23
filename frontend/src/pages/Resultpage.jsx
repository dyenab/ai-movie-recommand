import useResultStore from "../store/useResultStore";
import SearchInput from "../components/SearchInput";
import MovieCard from "../components/MovieCard";

export default function ResultPage() {
  const aiResponse = useResultStore((state) => state.aiResponse);
  const [movieInfo, setMovieInfo] = useState(null);

  const handleSearch = async (title) => {
    const result = await fetchMovieInfo(title);
    setMovieInfo(result);
  };

  return (
    <div>
      <h2>🧠 AI가 추천한 내용:</h2>
      <p>{aiResponse}</p>

      <SearchInput onSearch={handleSearch} />

      {movieInfo && <MovieCard info={movieInfo} />}
    </div>
  );
}
