import React from 'react'
import Characters from '../characters/Characters'

const App = () => {
  return (
      <div>
        <nav className="navbar navbar-expand-lg fixed-top navbar-dark shadow" style={{ backgroundColor: '#000' }}>
          <div className="container-fluid">
            <a className="navbar-brand m-auto p-0" href="/" >
              <img style={{ height: 40 }} alt="Marvel" src="https://i.annihil.us/u/prod/misc/marvel.svg" />
            </a>
          </div>
        </nav>

        <Characters />
      </div>
  )
}

export default App
