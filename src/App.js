import React from "react"
import Index from "./components/Dashboard/index"
import NavBar from "./components/Navbar"

import { GlobalStyle } from "./styles"

const App = () => (
  <div className="App">
    <NavBar />
    <Index />
    <GlobalStyle />
  </div>
)

export default App
