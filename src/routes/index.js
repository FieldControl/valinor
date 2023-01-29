import React from 'react';
import { Switch } from 'react-router-dom';

import MyRoute from './MyRoute';
import Home from '../view/Home';
import Details from '../view/Details';
import Search from '../view/Search';
import Page404 from '../view/Page404';

export default function Routes() {
  return (
    <Switch>
      <MyRoute exact path="/:page?" component={Home} />
      <MyRoute exact path="/details/:id" component={Details} />
      <MyRoute exact path="/search/:name" component={Search} />
      <MyRoute path="*" component={Page404} />
    </Switch>
  );
}
