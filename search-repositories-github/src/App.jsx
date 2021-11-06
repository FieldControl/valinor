import { BrowserRouter } from 'react-router-dom'

import { GlobalStyle } from "./global/styles/GlobalStyle";

import { Routes } from './routes'

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
      <GlobalStyle />
    </>
  )
}