import { ContextProvider } from './context/data-provider';
import GlobalStyle from './globalStyles';
import Home from './pages/home/home';
import Header from './components/header/header';
import { Switch, Route } from 'react-router-dom';
import Repos from './pages/repos/repos';

function App() {
  return (
    <ContextProvider>
      <GlobalStyle />
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/repo=:repoName" component={Repos} />
      </Switch>
    </ContextProvider>
  );
}

export default App;
