import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Header } from './components/Header';
import { ThemeProvider } from './hooks/useTheme';
import { Home } from './pages/Home';
import { SearchPage } from './pages/Search';

import './styles/index.scss';

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Header />
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/search">
            <SearchPage />
          </Route>
        </Switch>
      </ThemeProvider>
    </BrowserRouter>
  );
}
