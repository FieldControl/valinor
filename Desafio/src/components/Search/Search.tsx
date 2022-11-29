import { useState } from "react";
import "./Search.css";

const inputSearch = ({ onSearch }) => {
  const [input, setInput] = useState("");

  function handleSearch() {
    const data = {
      input,
    };
    onSearch(data);
  }

  return (
    <div className="searchMaster">
      <form className="search">
        <input
          type="text"
          placeholder="Digite o que deseja pesquisar..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" onClick={handleSearch}>
          Pesquisar
        </button>
      </form>
    </div>
  );
};

export default inputSearch;
