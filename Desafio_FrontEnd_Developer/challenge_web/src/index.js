//import dos módulos do react
import React from 'react';
import ReactDOM from 'react-dom';
//import do index do css
import './index.css';
//import do app
import App from './App';
//import dp modulo de report de dados de performance
import reportWebVitals from './reportWebVitals';
//renderização do app
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
