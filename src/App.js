
import { useLayoutEffect } from 'react';
import './App.css';
import Cabecalho from './componentes/Cabecalho';
import Rotas from './Rotas';

function App() {

    useLayoutEffect(()=>{
        // Analisando se o darkMode está ativado antes de renderizar a aplicação
        const darkMode = JSON.parse(localStorage.getItem("dark-mode"));
        darkMode && (document.querySelector("html").classList = "dark-mode");
        
    }, []);

    return (
        <div className="main">
            <Cabecalho />
            <Rotas />
        </div>
    );
}

export default App;
