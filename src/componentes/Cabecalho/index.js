import "./style.css";

import { BsFillMoonFill, BsFillSunFill } from "react-icons/bs";

import { VscGithubAlt } from "react-icons/vsc";
import { useLayoutEffect, useState } from "react";


function Cabecalho() {

    const [darkMode, setDarkMode] = useState(null);


    function mudaTema() {
        const darkModeInvertido = !darkMode;

        // tema escuro
        darkModeInvertido && (document.querySelector("html").classList = "dark-mode");
        
        // tema padrão
        !darkModeInvertido && (document.querySelector("html").classList = "");
        
        // adiciona novo valor de darkMode ao local e ao hook
        setDarkMode(darkModeInvertido);
        localStorage.setItem("dark-mode", darkModeInvertido);
    };


    useLayoutEffect(()=>{
        // verifica darkMode no localStorage
        const analiseDarkMode = JSON.parse(localStorage.getItem("dark-mode"));
        setDarkMode(analiseDarkMode);
    }, []);


    return (
        <header id="cabecalho">
            <h1 className="logo"> 
                <VscGithubAlt />
            </h1>

            <div 
                className={`dark-mode-botao ${darkMode && " dark-true"}`}
                onClick={()=>mudaTema()}
            >
                <div className="icone-dark-mode">
                    {darkMode?
                        <BsFillMoonFill />
                        :
                        <BsFillSunFill />
                    }
                </div>
            </div>
        </header>
    )
}

export default Cabecalho;