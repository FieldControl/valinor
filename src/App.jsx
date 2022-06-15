import React, { useState, useEffect } from "react";
import pokemonImg from './assets/pokemon.png'
import "react-toastify/dist/ReactToastify.min.css";
import "./app.scss";
import Header from "./components/header";
import Card from "./components/card/Card";
import Aside from './components/aside/Aside'

import axios from "axios";
import { AiOutlineStar } from 'react-icons/ai'

function App() {
  const [data, setData] = useState();
  const [page, setPage] = useState(0);

  useEffect(() => {
    axios
      .get(`https://pokeapi.co/api/v2/pokemon?limit=10&offset=${page * 20}`)
      .then((resp) => {
        setData(resp.data);
      });
  }, []);

  useEffect(() => {
    if (page === -1) setPage(0);
    axios
      .get(`https://pokeapi.co/api/v2/pokemon?limit=10&offset=${page * 20}`)
      .then((resp) => {
        setData(resp.data);
      });
  }, [page]);

  function getResults(result) {
    setData({ results: [result] });
  }

  function renderCards() {
    return data?.results.map((pokemon) => {
      return <Card name={pokemon.name} url={pokemon.url} />;
    });
  }

  return (
    <div className="App">


      <Header getResults={getResults} />
      <Aside />
      <div className="view-pokemon">

        <img className="pokemon-img" src={pokemonImg} alt="" />
        <button className="star-btn">
          <AiOutlineStar
            className="star"
            fill="yellow"
            size={20}
          />
          Star
        </button>

        <h1 className="pokemon-title">Pokemon</h1>
        <p className="pokemon-history">Pokémon é uma franquia de mídia centrada em criaturas ficcionais

          <a className="see-topics" href="">See topic</a></p>

      </div>
      <span className="results">1,341,169 repository results</span>
      <div className="card-container">{renderCards()}</div>
      <div className="btn-container">
        <button
          className="btn-previous"
          onClick={() => setPage(page - 1)}
        >
          {'<'} Previous
        </button>
        <div
          className="display">{page}</div>
        <button className="btn-next" onClick={() => setPage(page + 1)}>
          Next {'>'}
        </button>
      </div>
    </div>
  );
}

export default App;
