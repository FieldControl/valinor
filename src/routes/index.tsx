import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Issues from '../pages/Issues';

const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={Dashboard} />
    <Route path="/issues/:repository+" component={Issues} />
  </Switch>
);

export default Routes;
