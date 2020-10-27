import React from 'react';

import './header.css';

import logo from '../../assets/github.svg';

export default function Header() {
  return (
    <header>
      <div className="container">
        <div className="nav">
          <img src={logo} alt="github" />
          <div className="list">
            <h1>Why GitHub?</h1>
            <ul>
              <li />
            </ul>
          </div>
          <a href="/">Team</a>
          <a href="/">Enterprise</a>
          <div className="list">
            <h1>Explore</h1>
            <ul>
              <li />
            </ul>
          </div>
          <a href="/">Marketplace</a>
          <div className="list">
            <h1>Pricing</h1>
            <ul>
              <li />
            </ul>
          </div>
        </div>
        <div className="search-login">
          <div className="search">
            <input id="search" type="text" placeholder="Buscar" />
          </div>
          <div className="login">
            <a href="/">Sign in</a>
            <a href="/">Sign up</a>
          </div>
        </div>
      </div>
    </header>
  );
}
