import React from "react";
import "./Navbar.scss";
import cloud from "../../assets/cloud.png";

/**
 * Navbar Component 
 *
 * @component
 * @example

 * <Navbar  />
 */
const Navbar = () => {
  return (
    <nav className="nav">
      <div className="nav__left">
        <img
          className="nav__icon"
          width="40px"
          height="40px"
          src={cloud}
          alt="icon"
        />
        <span className="nav__title">Github Clone</span>
      </div>
      <ul className="nav__right">
        <li>
          <a href="/" alt="home">
            clean
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
