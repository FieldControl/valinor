import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'

import Search from './pages/Search'
import Home from './pages/Home'

function Routes () {
  return (
    <BrowserRouter>
      <Route path="/" exact component={Home} />
      <Route path="/search" component={Search} />
    </BrowserRouter>
  )
}

export default Routes