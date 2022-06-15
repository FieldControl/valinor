import React, { useState } from "react";
import './styles.scss'
import { toast, ToastContainer } from 'react-toastify';
import axios from "axios";
import { BsGithub } from 'react-icons/bs'
import { BiBell } from 'react-icons/bi'
import { RiArrowDownSFill } from 'react-icons/ri'
import DropdownMenu from "../menu/dropDownMenu";
import DropdownMenuAdd from '../menu/dropDownMenuAdd'

import AvatarImg from '../../assets/avatar.png'

function Header({ getResults }) {
  const [input, setInput] = useState("");

  function submit(e) {
    e.preventDefault()

    axios.get(`https://pokeapi.co/api/v2/pokemon/${input.toLowerCase()}/`).then((resp) => {
      getResults(resp.data)
      toast.success(`${input.toUpperCase()} encontrado com sucesso`)
    })
      .catch(error => {
        toast.error(`${input.toUpperCase()} não encontrado.`)
      })
  }

  return (
    <header className="header">
      <BsGithub
        className="github-img"
        size={32}
        fill="white"
      />
      <div className="input-container">
        <form onSubmit={(e) => submit(e)}>
          <input
            className="input-search"
            type="text"
            name="pokemon"
            placeholder="Search or jump to..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
        <button className="btn-bar">/</button>
        <div className="list-nav">
          <a className="types-list">Pull requests</a>
          <a className="types-list" >Issues</a>
          <a className="types-list" >Marketplace</a>
          <a className="types-list" >Explore</a>
        </div>

      </div>
      <div className="list-avatar">
        <BiBell
          fill="white"
          size={18}
          className="bell-avatar"
          title="You have no unread notifications"
        />

        <a>+</a>
        <DropdownMenuAdd />
        <img className="avatar-img" src={AvatarImg} alt="avatar" />
        <DropdownMenu />


      </div>
      <ToastContainer
        text-transform="uppercase"
      />
    </header>
  );
}

export default Header;
