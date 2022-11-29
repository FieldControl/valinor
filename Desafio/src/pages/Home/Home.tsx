import { useEffect, useState } from "react";
import Cards from "../../components/Cards/Cards";
import Search from "../../components/Search/Search";
import Pagination from "../../components/Pagination/Pagination";
import "./Home.css";

const limit = 12;

function Home() {
  const [repositories, setRepositories] = useState([]);
  const [search, setSearch] = useState([]);
  const [totalCount, setTotalCount] = useState([]);
  const [offset, setOffset] = useState(0);

  function handleSearch(data) {
    setSearch(data.input);
  }

  useEffect(() => {
    const query = {
      page: {
        limit,
        offset,
      },
    };

    if (search) {
      query.filter = {
        search,
      };
    }

    console.log(offset);

    fetch(
      `https://api.github.com/search/repositories?q=${search}&per_page=12&page=${offset}`
    )
      .then((response) => response.json())
      .then((data) => {
        setTotalCount(data.total_count);
        setRepositories(data.items);
      })
      .catch((error) => console.log(error));
  }, [search, offset]);

  return (
    <div className="container">
      <h1>Pesquisa GitHub</h1>
      <Search onSearch={handleSearch} />
      {search.length === 0 && (
        <div className="noResearch">Sem repositórios, faça sua pesquisa...</div>
      )}
      {totalCount >= 1 && (
        <div className="results">Total de resultado: {totalCount}</div>
      )}
      <Cards data={repositories} />
      {totalCount && (
        <Pagination limit={limit} offset={offset} setOffset={setOffset} />
      )}
    </div>
  );
}

export default Home;
