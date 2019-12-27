import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Search from './pages/Search';

export default function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Search} />
      </Switch>
    </BrowserRouter>
  );
}
