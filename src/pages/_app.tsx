import { Menu } from "../components/Menu";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  return (
    <div id="app">
      <Menu />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
