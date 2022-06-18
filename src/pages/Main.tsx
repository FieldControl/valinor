import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../style/main.module.css'


const Main: React.FC = () => {
  const navigate = useNavigate();
  const [param, setParam] = useState<string>('');
  const [quote, setQuote] = useState<string>('');

  const quotes = ['Search more than 315M repositories', 'Search more than 92M users', 'Search more than 553M issues'];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * 2)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className={ style.main_header }>
        <img
          className={ style.header_icon}
          src="https://cdn.icon-icons.com/icons2/2429/PNG/512/github_logo_icon_147285.png" alt="GitHub Icon"
          onClick={ () => navigate(`/`)}
        />
      </header>
      <main>
        <h2 className={ style.main_title}> {quote} </h2>
        <section>
          <input className={ style.main_input } onChange={(event) => setParam(event.target.value)} placeholder="Search Github" />
          <button className={ style.main_button } onClick={() => { if(param) navigate(`/search/${param}`)}} type="button"> Search</button>
        </section>
      </main>
    </>
  );
}

export default Main;
