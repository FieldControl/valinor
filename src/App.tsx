import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Detail from './pages/Detail';
import Main from './pages/Main';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}/>
        <Route path="/:id" element={<Detail />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
