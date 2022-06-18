import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import style from '../style/main.module.css'


const Main: React.FC = () => {
  
  //    ESTADO E HOOK PARA REDIRECIONAR PARA A PÁGINA QUE O USUÁRIO COLOCAR NO INPUT.
  const navigate = useNavigate();
  const [param, setParam] = useState<string>('');

  //    RENDERIZAR UMA FRASE ALEATÓRIA DO ARRAY.
  const [quote, setQuote] = useState<string>('');
  const quoteArr = ['Search more than 315M repositories', 'Search more than 92M users', 'Search more than 553M issues'];
  useEffect(() => {
    setQuote(quoteArr[Math.floor(Math.random() * 2)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header barVisibily={false} />

      <section className={ style.main }>
        <h2 className={ style.main_title }> { quote } </h2>
        <div>
          <input className={ style.main_input } onChange={(event) => setParam(event.target.value)} placeholder="Search Github" />
          <button className={ style.main_button } onClick={() => { if(param) navigate(`/search/${param}`)}} type="button"> Search</button>
        </div>
      </section>
    </>
  );
}

export default Main;
