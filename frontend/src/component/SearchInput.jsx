// components/SearchInput.jsx
import { useState } from "react";

export default function SearchInput({ onSearch }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSearch(text); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="영화 제목 입력"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">🔍 검색</button>
    </form>
  );
}
