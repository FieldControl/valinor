import { BrowserRouter } from 'react-router-dom';
import { Routes } from './routes';
import GlobalStyle from './styles/globalStyle';

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
      <GlobalStyle />
    </>
  );
}
