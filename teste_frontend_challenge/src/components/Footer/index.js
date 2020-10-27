import React from 'react';

import './footer.css';

import logo from '../../assets/github.svg';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="copyrigth">
          <img src={logo} alt="github" />
          <h1>2020 Github, Inc.</h1>
        </div>
        <a href="/">Terms</a>
        <a href="/">Privacy</a>
        <a href="/">Security</a>
        <a href="/">Status</a>
        <a href="/">Help</a>
        <a href="/">Contact GitHub</a>
        <a href="/">Pricing</a>
        <a href="/">API</a>
        <a href="/">Training</a>
        <a href="/">Blog</a>
        <a href="/">About</a>
      </div>
    </footer>
  );
}
