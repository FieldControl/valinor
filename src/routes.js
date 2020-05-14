import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import LoadingBar from 'react-top-loading-bar';

const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))

function Routes() {
  return (
    <BrowserRouter>
    <Suspense fallback={<LoadingBar progress={100} height={3} color='#f11946' />}>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/search" exact component={Search} />
      </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default Routes;
