import React, { useState, useEffect } from "react";
import "./styles.scss";
import axios from "axios";
import { BiBook } from 'react-icons/bi'
import { AiOutlineStar } from 'react-icons/ai'
import Modal from "../modal/Modal";

function Card({ name, url }) {
  const [pokemon, setPokemon] = useState();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios.get(`https://pokeapi.co/api/v2/pokemon/${name}/`).then((resp) => {
      setPokemon(resp.data);
    });
  }, [url]);
  return (
    <>

      <div className="card" id={name} onClick={() => setIsOpen(true)}>

        <div className="types-container">

          <div className="details">
            <span className="details-list">
              <AiOutlineStar
                fill="yellow"
                size={18}
                className='star'
              />


              <span> {pokemon?.types[0].type.name}</span>
              <span> Updated 2 hours ago</span>
              <span> 66 issues need help</span>

            </span>
          </div>
          <div className="name">
            <BiBook
              className="book"
              size={19}
              fill="gray"
            />
            pokemon/{name}</div>
          <div className="list-types">
            <div className="types">{pokemon?.types[0].type.name}</div>
            <div className="types">{pokemon?.weight}</div>
            <div className="types">{pokemon?.base_experience}xp</div>
            <div className="types">{pokemon?.height}
            </div>
          </div>
          <span
            className="details-pokemon"
          >Pokemon do nome {name} e do tipo {pokemon?.types[0].type.name}</span>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <img src={pokemon?.sprites.front_default} alt="Pokemon sprite" />
        <table>
          <tbody>
            <tr>
              <td className="names">Name:</td>
              <td className="resposta">{name}</td>
            </tr>
            <tr>
              <td className="names">Weight:</td>
              <td className="resposta">{pokemon?.weight}</td>
            </tr>
            <tr>
              <td className="names">Type:</td>
              <td className="resposta">{pokemon?.types[0].type.name}</td>
            </tr>
            <tr>
              <td className="names">Base Experience:</td>
              <td className="resposta">{pokemon?.base_experience}</td>
            </tr>
            <tr>
              <td className="names">Height:</td>
              <td className="resposta">{pokemon?.height}</td>
            </tr>
            <tr>
              <td className="names">Principal Move</td>
              <td className="resp">{pokemon?.moves[0].move.name}</td>
            </tr>
          </tbody>
        </table>
      </Modal>
    </>
  );
}

export default Card;
