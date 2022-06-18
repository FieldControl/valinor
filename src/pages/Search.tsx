import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchCard from '../components/SearchCard';
import style from '../style/search.module.css'

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
  const [loading, setLoading] = useState<boolean>(true);

  const { query } = useParams<string>();
  const navigate = useNavigate();

  const currentPage = data.slice((page * 10) - 10, page * 10);

  async function fetchAPI(param: string | undefined) {
    const response = await fetch(`https://api.github.com/search/repositories?q=${param}`);
    const data = await response.json();
    setData(data.items);
    setTotal(data.total_count);
    setLoading(false);
  }

  useEffect(() => {
    fetchAPI(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = (): void => {
    if (param) {
      setLoading(true);
      navigate(`/search/${param}`);
      setData([]);
      setPage(1);
      fetchAPI(param);
    }
  }

  const Loaded = (
    <section className={style.loaded_section}>
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

      <section className={style.page_nav}>
        <button className={style.page_button} disabled={page === 1} onClick={() => setPage(page - 1)}> {'< Previous'} </button>
        <p className={style.page_count}>{`  ${page} | ${Math.ceil(data.length / 10)}  `} </p>
        <button className={style.page_button} disabled={(data.length / page) <= 10} onClick={() => setPage(page + 1)}>{'Next >'}</button>
      </section>

    </section>
  );

  const notLoaded = (<img className={style.loading} alt="Progress Bar" src="https://i.pinimg.com/originals/49/23/29/492329d446c422b0483677d0318ab4fa.gif" />);

  return (
    <>
      <header className={style.detail_header}>
        <img
          className={style.header_icon}
          src="https://cdn.icon-icons.com/icons2/2429/PNG/512/github_logo_icon_147285.png" alt="GitHub Icon"
          onClick={() => navigate(`/`)}
        />
        <input className={style.header_input} onChange={(event) => setParam(event.target.value)} />
        <button className={style.header_button} onClick={() => refreshData()} type="button"> Search </button>
      </header>
      <main className={style.mainbar}>
        <h1 className={style.main_title}>{`${total} repository results`}</h1>
        {!loading ? Loaded : notLoaded}
      </main>
    </>
  );
}


export default Search;