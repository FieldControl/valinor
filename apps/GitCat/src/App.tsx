import React from 'react'
import Routes from './routes'

import { QueryContextProvider } from './contexts/queryContext'

import Globals from './styles/globals'

function App() {
  return (
    <QueryContextProvider>
      <Globals />
      <Routes />
    </QueryContextProvider>
  )
}

export default App
