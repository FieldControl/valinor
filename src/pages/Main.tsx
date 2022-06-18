import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Main: React.FC = () => {
  const navigate = useNavigate();
  const [param, setParam] = useState<string>('');
  const [quote, setQuote] = useState<string>('');

  const quotes = ['Search more than 315M repositories', 'Search more than 92M users', 'Search more than 553M issues'];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * 2)])
  }, []);

  return (
    <>
      <header className='main-header'>
        <img
          className="header-icon"
          src="https://cdn.icon-icons.com/icons2/2429/PNG/512/github_logo_icon_147285.png" alt="GitHub Icon"
        />
      </header>
      <main>
        <h2 className="main-title"> {quote} </h2>
        <section>
          <input className="main-input" onChange={(event) => setParam(event.target.value)} placeholder="Search Github" />
          <button className="main-button" onClick={() => navigate(`/search/${param}`)} type="button">        Search</button>
        </section>
      </main>
    </>
  );
}

export default Main;
