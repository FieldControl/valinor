import React from "react";
import "../../../style/style.css"
import { Link } from "react-router-dom";

// navbar  a ser renderizado em telas menores (estilo hamburguer)
const MenuHamb = () => {
  return (
    <div className="hamburguer">
      <div className="Item-menu2">
        <Link className="menu2" to="/characters" >Characters</Link>
      </div>
      <div className="Item-menu2">
        <Link className="menu2" to="/comics" >Comics</Link>
      </div>
      <div className="Item-menu2">
        <Link className="menu2" to="/series" > Series</Link>
      </div>
      <div className="Item-menu2">
        <Link className="menu2" to="/events">Home</Link>
      </div>
    </div>
  )
}

export default MenuHamb;