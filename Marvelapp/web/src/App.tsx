import React, { useEffect } from 'react';
import './styles/global.css';
import { Outlet } from 'react-router-dom';
import Nav from "./components/Menu/nav";


const App: React.FC = () => {
return(
  <div>
  <Nav />
  <Outlet />
</div>
)  
   
};

export default App;

