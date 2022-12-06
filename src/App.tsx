import 'react-calendar-heatmap/dist/styles.css';

import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';

import RoutesList from './routes';

import GlobalStyles from './styles/GlobalStyles';

import './styles/ReactToastify.css';

import { ThemeName, themes } from './styles/themes';

const App: React.FC = () => {
  const [themeName, setThemeName] = useState<ThemeName>(localStorage.getItem('@Github:theme') === 'dark' ? 'dark' : 'light');
  const currentTheme = themes[themeName];

  return (
    <ThemeProvider theme={currentTheme}>
      <BrowserRouter>
        <ToastContainer />
        <GlobalStyles />
        <RoutesList theme={themeName} onChange={setThemeName} />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
