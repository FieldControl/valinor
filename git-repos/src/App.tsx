import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Home } from './pages/Home';
import { SearchPage } from './pages/Search';

import './styles/global.scss';

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/search">
          <SearchPage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
