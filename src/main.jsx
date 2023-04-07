import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ModoProvider } from './context/ModoContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModoProvider>
      <App />
    </ModoProvider>
  </React.StrictMode>,
)
