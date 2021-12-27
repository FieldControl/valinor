import { useLayoutEffect, useState } from "react";
import "./style.css";

import { useSelector, useDispatch } from "react-redux";
import { Creators as repositoriosCreators } from "../../store/ducks/repositorios";
import { useHistory, useParams } from "react-router-dom";


function PaginacaoRepositorios() {

    const { pesquisaParametro } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();

    const { listaRepositorios, paginaAtual } = useSelector(state=>state.repositorios);

    const [paginasListagem, setPaginasListagem] = useState(null);


    function retornaPaginacao(paginasTot) {

        // Essa função retorna uma lista de elementos de paginação
        // o loop for contém uma série de condicionais que vão trabalhar em cima dos dados
        /*
            Exemplo de retorno quando a páginaAtual é 5:

            listaDePaginas = [(1), (...), (3), (4), ((5)), (6), (7), (...), (99)]
        */
        
        let listaDePaginas = [];

        for(let numero = 1; numero <= paginasTot; numero++){
            let valorParaAdicionar;

            if(numero === 1) {
                valorParaAdicionar = numero;

            } else if(Math.abs(paginaAtual - numero) <= 2) {
                valorParaAdicionar = numero;

            } else if(Math.abs(paginaAtual - numero) === 3) {
                valorParaAdicionar = "...";   
            } 
            
            if(numero === paginasTot) {
                valorParaAdicionar = paginasTot;
            }

            if(valorParaAdicionar) {
                listaDePaginas.push(valorParaAdicionar);
            }
        }

        return listaDePaginas;
    }


    function pesquisandoPorPagina(pagina) {
        history.push(`/search/${pesquisaParametro}/${pagina}`);
    }


    useLayoutEffect(()=>{
        if(listaRepositorios && listaRepositorios.total_count) {
            let paginasTot = listaRepositorios.total_count / 10;
            if(paginasTot > 100){
                paginasTot = 100;
            }

            const paginas = retornaPaginacao(Math.ceil(paginasTot));

            setPaginasListagem(paginas);

            
        }

    }, [listaRepositorios]);

    return (
        <div className="paginando">
            {paginasListagem && listaRepositorios.items &&
                paginasListagem.map((pagina, key)=>{
                    if(pagina === "...") {
                        return(
                            <div key={key}>
                                <span>{pagina}</span>
                            </div>
                        )

                    } else {
                        return (
                            <div 
                                key={key} 
                                className={`pagina ${paginaAtual == pagina? " foco" : ""}`}
                                onClick={()=>{
                                    pesquisandoPorPagina(pagina);
                                }}
                            >
                                <span>{ pagina }</span>
                            </div>
                        )
                    }
                })
            }
        </div>
    )
}


export default PaginacaoRepositorios;