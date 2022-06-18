import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Data {
  id: number,
  name: string,
  full_name: string,
}

const Search: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [page, setPage] = useState<number>(1);
  const [param, setParam] = useState<string>('');

  const { query } = useParams<string>();
  const navigate = useNavigate();

  const currentPage = data.slice((page * 10) - 10, page * 10);

  async function fetchAPI(param: string | undefined) {
    const response = await fetch(`https://api.github.com/search/repositories?q=${param}`);
    const data = await response.json();
    setData(data.items);
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
        <button onClick={(refreshData)}  type="button"> Search </button>
      </header>

      <main>
        {data.length > 1 ?
          <>
            {currentPage.map((data) => (
            <li onClick={() => navigate(`/details/${data.full_name}`)} key={data.id}>{data.id + ' ' + data.name + ' ' + data.full_name}</li>))}
            <button disabled={page === 1} onClick={() => setPage(page - 1)}> Previous Page </button>
            {`  ${page} / ${Math.ceil(data.length / 10)}  `}
            <button disabled={(data.length / page) <= 10} onClick={() => setPage(page + 1)}> Next Page </button>
          </>
        : <h1> Loading </h1>}
      </main>
    </>
  );
}


export default Search;