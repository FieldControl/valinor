import React from 'react'
import ReactDOM from 'react-dom/client'
import Home from './pages/Home/Home'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
)
