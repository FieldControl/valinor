import './App.css';
import Search from './components/Search/Search';

import dark from './assets/dark.png';
import light from './assets/light.png';

import { useContext } from 'react';
import { ModoContext } from './context/ModoContext';//importando o context
import { ModoProvider } from './context/ModoContext';

function App() {
  
  const { filterInvert, mode, img, txtmodo, txtcor, backgroundHeader_Footer, colorheader_footer, backgroundSearch, alterModo } = useContext(ModoContext);

  return (
    <div className="App" >
      <header id='header' style={{background: backgroundHeader_Footer, color: colorheader_footer}}>
        <h1>Pesquise Repositórios no GitHub</h1>
        <button style={{background: mode, color: txtcor}} onClick={alterModo} ><img style={{filter: filterInvert}} src={img}></img>{txtmodo}</button>
      </header>
      <main>
        <Search />
      </main>
      <footer style={{background: backgroundHeader_Footer, color: colorheader_footer}}>
        <p>Desenvolvido por <a href='https://github.com/EGBDS' target='_blank'>EGBDS</a></p>
      </footer>
    </div>
  )
}

export default App;
