import Header from './components/Header';
import Footer from './components/Footer';
import RenderItemCard from './components/RenderItemCard';
import GlobalStyles from './styles/GlobalStyles';

const App = () => {
  return (
    <div id='root'>
      <GlobalStyles/>
        <Header/>
        <RenderItemCard />
        <Footer />
    </div>
  );
}

export default App;
