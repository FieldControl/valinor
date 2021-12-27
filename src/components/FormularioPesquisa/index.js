import { useEffect, useState } from "react";
import "./style.css";

import { Creators as repositoriosCreators } from "../../store/ducks/repositorios";
import { useDispatch } from "react-redux";

import { useHistory, useParams } from "react-router-dom";



function FormularioPesquisa() {
    
    const history = useHistory();
    const dispatch = useDispatch();
    const { pesquisaParametro } = useParams();

    const [textoPesquisa, setTextoPesquisa] = useState("");


    useEffect(()=>{
        if(!pesquisaParametro) {
            setTextoPesquisa("");

        } else {
            setTextoPesquisa(pesquisaParametro);

        }
    }, [pesquisaParametro]);


    function pesquisando() {
        // função que faz as configurações necessárias para fazer a pesquisa
        

        /* 
            Aqui precisei trocar o sinal "/" por "+" pois foi a única forma que encontrei
        para lidar com situações em que o usuário digitar a url completa para o diretório
        (ex: usuario/projetoDoUsuario)
            Antes de fazer a requisição, "+" será trocado por "/"
        
        */
        const pesquisaSemEspacoBranco = textoPesquisa.trim().replace("/", "+");

        if(pesquisaSemEspacoBranco) {
            // Salva o texto e a página da pesquisa no reducer

            dispatch(repositoriosCreators.setTextoPesquisa(pesquisaSemEspacoBranco));

            // Usa a creator que chama o saga responsável por fazer a requisição à api
            // e retornar os repositórios
            dispatch(repositoriosCreators.getRepositorios(pesquisaSemEspacoBranco));
        }
        
        history.push(`/search/${pesquisaSemEspacoBranco}`);
        return;
    }


    return (
        <form className="inicio-formulario" onSubmit={e=>{
            e.preventDefault();
        }}>
            <input
                type="text"
                placeholder="Busque repositórios"
                value={textoPesquisa}
                onChange={e=>{
                    setTextoPesquisa(e.target.value);
                }}
                onKeyPress={e=>{
                    if(e.key === "Enter") {
                        pesquisando();
                    }
                }}
            />

            <input 
                type="button"
                value="Buscar"
                onClick={()=> pesquisando() }
            />
        </form>       
    )
}


export default FormularioPesquisa;