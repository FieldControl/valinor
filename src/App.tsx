import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Detail from './pages/Detail';
import Main from './pages/Main';
import Search from './pages/Search';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}/>
        <Route path="/search/:query" element={<Search />}/>
        <Route path="/details/:username/:reponame" element={<Detail />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
