import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Home } from './pages/Home';
import { Repository } from './pages/Repository';

export function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route
          path="/repository/:username/:repo_name"
          exact
          component={Repository}
        />
      </Switch>
    </BrowserRouter>
  );
}
