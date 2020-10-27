import React from 'react';

import './styles/global.css';
import './styles/main.css';

import repository from './assets/repository.svg';
import star from './assets/estrela.svg';

import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';

function App() {
  return (
    <>
      <Header />

      <main>
        <div className="container-middle">
          <div className="left">
            <div className="repositories">
              <div className="cards">
                <div className="card">
                  <a href="/">Repositories</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Code</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Commits</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Issues</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Discussions</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Packages</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Marketplace</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Topics</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Wikis</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Users</a>
                  <h1>963K</h1>
                </div>
              </div>
            </div>
            <div className="languages">
              <div className="cards">
                <h1>Languages</h1>
                <div className="card">
                  <a href="/">JavaScript</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">HTML</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">TypeScript</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">CSS</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">C++</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Shell</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Python</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Java</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">Dockerfile</a>
                  <h1>963K</h1>
                </div>

                <div className="card">
                  <a href="/">CoffeeScript</a>
                  <h1>963K</h1>
                </div>
              </div>
            </div>
          </div>

          <div className="right">
            <div className="results">
              <h1>963,346 repository results</h1>
              <button type="button">Sort: Best match</button>
            </div>
            <div className="card-grid">
              <img src={repository} alt="repositorio" />
              <div className="card">
                <div className="header-card">
                  <h1>
                    ArlanBiati/
                    <span>fiedlControl</span>
                  </h1>
                </div>

                <p>Teste Frontend Challenger</p>

                <div className="card-bottom">
                  <div className="stars">
                    <img src={star} alt="estrela" />
                    <h1>8</h1>
                  </div>

                  <div className="language">
                    <div />
                    <h1>JavaScript</h1>
                  </div>

                  <div className="update">
                    <h1>Updated on</h1>
                    <h1>26 Out 2020</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
