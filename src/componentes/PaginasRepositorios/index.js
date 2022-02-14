import React, { useLayoutEffect, useState } from "react";
import "./style.css";

import { useSelector } from "react-redux";

import { useParams, useNavigate } from "react-router-dom";


function carregaTotalDePaginas(dadosRepositorios) {
    
    const todosOsResultados = dadosRepositorios.total_count;
    const repositoriosPorPagina = dadosRepositorios.items.length;
    let totalDePaginas;
    /*
    totalDePaginas é resultado da divisão entre todos os resultados de uma busca
    e a quantidade de repositórios exibidos por página.
        ex: 100 resultados / 20 repositórios por pagina = 5 páginas.
    */
    
    if(todosOsResultados > 1000) {
        // 1000 é o resultado máximo que a api do github fornece por busca.
        totalDePaginas = Math.ceil(1000 / repositoriosPorPagina);
    } else {

        totalDePaginas = Math.ceil(todosOsResultados / repositoriosPorPagina);
    };
    
    return totalDePaginas;
};


function retornaPaginacao(paginasTot, paginaAtual) {
    // Retorna Array de paginação
    /*
        Exemplo de retorno quando a páginaAtual é 5:
        listaDePaginas = [(1), (...), (3), (4), ((5)), (6), (7), (...), (99)]
    */
    
    let listaDePaginas = [];
    const primeiraPagina = 1;
    const ultimaPagina = paginasTot;

    for(let numero = 1; numero <= ultimaPagina; numero++){
        let valorParaAdicionar;
        const espacamentoEntrePaginas = Math.abs(paginaAtual - numero);

        (function personalizandoArray(){
        
            (espacamentoEntrePaginas <= 2) && (valorParaAdicionar = numero);
    
            (espacamentoEntrePaginas === 3) && (valorParaAdicionar = "...");   
            
            (numero === primeiraPagina) && (valorParaAdicionar = primeiraPagina);
            (numero === ultimaPagina) && (valorParaAdicionar = ultimaPagina);
                
            valorParaAdicionar && listaDePaginas.push(valorParaAdicionar);
        }()) 
    }

    return listaDePaginas;
}



export default function PaginasRepositorios() {

    const [arrayPaginas, setArrayPaginas] = useState([]);
    const { repositorios, load } = useSelector(state=>state.searchData);

    const { searchText, pagina: paginaParametro=1 } = useParams();
    const navigate = useNavigate();

    
    function pesquisandoPorPagina(paginaEscolhida) {
        navigate(`/search/${searchText}/${paginaEscolhida}`);
    };

    useLayoutEffect(()=>{
        if(repositorios && repositorios.total_count) {
            // Inicia o carregamento das páginas
            const totalDePaginas = carregaTotalDePaginas(repositorios);

            const paginasEmLista = retornaPaginacao(totalDePaginas, paginaParametro);

            setArrayPaginas(paginasEmLista);

        };
    }, [repositorios, paginaParametro]);


    return (
        <React.Fragment>
            {arrayPaginas && load &&
                <div className="area-paginacao">
                    <ul className="paginacao-lista">
                        {arrayPaginas.map((pagina, key)=>{
                            return pagina === "..."?
                                <li key={key} className="reticencia">
                                    <span>{pagina}</span>
                                </li>
                                :
                                <li 
                                    key={key}
                                    className={`${Number(paginaParametro) === pagina? "foco" : "sem-foco"}`}
                                    onClick={()=>{
                                        pesquisandoPorPagina(pagina);
                                    }}
                                >
                                    <span>{pagina}</span>
                                </li>
                            
                        })}
                    </ul>
                </div>
            }
        </React.Fragment>
    );
};