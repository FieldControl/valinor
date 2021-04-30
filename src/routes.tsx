import { Route, Switch } from 'react-router-dom';

import { Home } from './pages';

export function Routes() {
  return (
    <>
      <Switch>
        <Route path="/" exact component={Home} />
      </Switch>
    </>
  );
}
