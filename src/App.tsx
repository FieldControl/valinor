import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Detail from './pages/Detail';
import Main from './pages/Main';
import Search from './pages/Search';


const App: React.FC = () => {
  return (
      <Switch>
        <Route exact path="/" component={ Main }/>
        <Route path="/search/:query" component={ Search }/>
        <Route path="/details/:username/:reponame" component={ Detail }/>
      </Switch>
  );
}

export default App;
