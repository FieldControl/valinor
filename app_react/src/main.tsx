import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SearchRepoProvider } from './context/SearchRepo.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <SearchRepoProvider>
     <App />
   </SearchRepoProvider>
  </React.StrictMode>,
)
