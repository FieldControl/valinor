import React from 'react';
import './App.css';
import BottomPagination from './components/BottomPagination';
import MainContent from './containers/MainContent';
import NavigationTopBar from './containers/NavigationTopBar';

const App = () => (
  <div className="App">
    <NavigationTopBar />
    <MainContent />
    <BottomPagination />
  </div>
);

export default App;
