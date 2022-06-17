import React, { useEffect, useState } from 'react';

interface Result {
  id: number,
  name: string,
  full_name: string,
}

const Main: React.FC = () => {
  const [data, setData] = useState<Result[]>([]);
  const [page, setPage] = useState<number>(1);

  async function fetchAPI(){
    const response = await fetch('https://api.github.com/search/repositories?q=bootstrap');
    const data = await response.json();
    setData(data.items);
  }

  useEffect(() => {
    fetchAPI();
  }, []);

  const currentPage = data.slice((page * 10) - 10, page * 10);

  return (
    <>
      {currentPage.map((data) => (<li key={data.id}>{data.id + ' ' + data.name + ' ' + data.full_name}</li>))}
      { page !== 1 && <button onClick={() => setPage(page - 1)}> Previous Page</button>}
      {(data.length / page) > 10 && <button onClick={() => setPage(page + 1)}> Next Page</button>   }   
    </>
  );
}

export default Main;
