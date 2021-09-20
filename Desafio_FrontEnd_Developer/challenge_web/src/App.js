//import do mídulo do react
import './App.css';
//import do módulo do bootstrap
import 'bootstrap/dist/css/bootstrap.css';
//imports dos componentes
import Header from './components/Header'
import Features from './components/Features'
import Works from './components/Works'
import OurTeam from './components/OurTeam'
import Testimonials from './components/Testimonials'
import Download from './components/Download'
import Footer from './components/Footer'
//função construtora do app
function App() {
    return (

        <div className="App" >

            <Header />
            <Features />
            <Works />
            <OurTeam />
            <Testimonials />
            <Download />
            <Footer />

        </div>
    );
}

export default App;