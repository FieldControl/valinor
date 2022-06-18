import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchCard from '../components/SearchCard';

interface Data {
  id: number,
  name: string,
  full_name: string,
  description: string,
  topics: string[],
  updated_at: string,
  language: string,
}

const Search: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [param, setParam] = useState<string>('');

  const { query } = useParams<string>();
  const navigate = useNavigate();

  const currentPage = data.slice((page * 10) - 10, page * 10);

  async function fetchAPI(param: string | undefined) {
    const response = await fetch(`https://api.github.com/search/repositories?q=${param}`);
    const data = await response.json();
    setData(data.items);
    setTotal(data.total_count);
  }

  useEffect(() => {
    fetchAPI(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = (): void => {
    navigate(`/search/${param}`);
    setData([]);
    setPage(1);
    fetchAPI(param);
  }

  return (
    <>
      <header>
        <input onChange={(event) => setParam(event.target.value)} />
        <button onClick={(refreshData)} type="button"> Search </button>
      </header>

      <main>
        {data.length > 1 ?
          <>
            <h1>{`${total} repository results`}</h1>
            {currentPage.map((data) => (
              <SearchCard
                id={data.id}
                name={data.name}
                full_name={data.full_name}
                description={data.description}
                topics={data.topics}
                updated_at={data.updated_at}
                language={data.language}
              />))}
            <button disabled={page === 1} onClick={() => setPage(page - 1)}> Previous Page </button>
            {`  ${page} / ${Math.ceil(data.length / 10)}  `}
            <button disabled={(data.length / page) <= 10} onClick={() => setPage(page + 1)}> Next Page </button>
          </>
          : <p> Loading... </p>}
      </main>
    </>
  );
}


export default Search;