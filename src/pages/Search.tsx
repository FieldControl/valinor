import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import Header from '../components/Header';
import style from '../style/search.module.css'
import { repoData } from '../interfaces';

const Search: React.FC = () => {

  //    CONSUMINDO DADOS DA API NA MONTAGEM DO COMPONENTE E ATRIBUINDO A ESTADOS NA APLICAÇÃO.
  const { query } = useParams<string>();
  const [data, setData] = useState<repoData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);  
  
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
  
  //    CONSTRUINDO SISTEMA DE PAGINAÇÃO.
  const [page, setPage] = useState<number>(1);
  const currentPage = data.slice((page * 10) - 10, page * 10);

  //    RENDERIZAÇÃO PARA ESPERAR A RESPOSTA DA API.
  if (loading) {
    return (
      <>
        <Header barVisibily={true} />
        <div className={style.load_container}>
          <img className={style.loading} alt="Progress Bar" src={require('../assets/loading.gif')} />
        </div>
      </>
    )
  }

  //    RENDERIZAÇÃO COM A RESPOSTA DA API PRONTA.
  return (
    <>
      <Header barVisibily={true} />

      <section className={style.mainbar}>
        <h1 className={style.main_title}>{`${total} repository results`}</h1>
        <div className={style.loaded_section}>
          {currentPage.map((data) => <Card key={data.full_name} data={data} />)}
          <div className={style.page_nav}>
            <button className={style.page_button} disabled={page === 1} onClick={() => setPage(page - 1)}> {'< Previous'} </button>
            <p className={style.page_count}>{`  ${page} | ${Math.ceil(data.length / 10)}  `} </p>
            <button className={style.page_button} disabled={(data.length / page) <= 10} onClick={() => setPage(page + 1)}>{'Next >'}</button>
          </div>
        </div>
      </section>
    </>
  );
}


export default Search;