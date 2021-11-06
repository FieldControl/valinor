import { BrowserRouter } from 'react-router-dom'

import { GlobalStyle } from "./global/styles/GlobalStyle";

import { Routes } from './routes'
import { DataProvider } from './hooks/DataContext';

import { Dashboard } from './components/Dashboard';

export function App() {
  return (
    <>
      <DataProvider>
        <BrowserRouter>
          <Dashboard>
            <Routes />
          </Dashboard>
        </BrowserRouter>
      </DataProvider>
      <GlobalStyle />
    </>
  )
}