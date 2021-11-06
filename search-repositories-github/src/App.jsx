import { BrowserRouter } from 'react-router-dom'

import { GlobalStyle } from "./global/styles/GlobalStyle";

import { Routes } from './routes'
import { Header } from './components/Header'
import { DataProvider } from './hooks/DataContext';

export function App() {
  return (
    <>
      <DataProvider>
        <Header />
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </DataProvider>
      <GlobalStyle />
    </>
  )
}