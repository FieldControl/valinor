import { useEffect } from "react";
import "./style.css";

import SearchFormulario from "../../componentes/SearchFormulario";
import PaginasRepositorios from "../../componentes/PaginasRepositorios";
import GifLoader from "../../componentes/GifLoader";

import { BsStarFill } from "react-icons/bs";
import { AiOutlineFile } from "react-icons/ai";
import { FiUser } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import { Creators as searchCreators } from "../../store/ducks/searchData";

import { useNavigate, useParams } from "react-router-dom";

import moment from "moment";


function ultimaAtualizacaoRepositorio(data){
  return `Updated ${moment(data).fromNow()}`;
};


export default function Busca() {
    const { searchText, pagina } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { repositorios, load } = useSelector(state=>state.searchData);
    

    const redirecionaParaRepositorio=(nomeRepositorio)=>{
      navigate(`/${nomeRepositorio}`);
    };


    useEffect(()=>{
      
      (function getRequisicaoRepositorios() {
        // função responsável por iniciar a requisição

        // Load false diz para o script que a requisição ainda não foi completada
        dispatch(searchCreators.setLoad(false));

        if(pagina) {
            const analiseInteiro = /^[0-9]+$/;
            if(analiseInteiro.test(pagina)){
                // chamando creator de requisição com página
                dispatch(searchCreators.getRepositorios(searchText, pagina));
            }

        } else {
          // chamando creator de requisição sem página
          dispatch(searchCreators.getRepositorios(searchText));
        };
      }());
    }, [searchText, pagina, dispatch]);


    return (
      <section className="busca">
        
        <SearchFormulario />

        <section className="conteudo-busca">

          <ul className="lista-repositorios">

            {!load && 
              <GifLoader />
            }

            {load && !repositorios &&
              // Sem resultados
              <div className="sem-lista">
                Nenhum resultado encontrado
              </div>
            }

            {load && repositorios &&
              repositorios.items.map((item, key)=>{
                return (
                  <li className="repositorio-item" key={key} onClick={()=>{
                    redirecionaParaRepositorio(item.full_name);
                  }}>


                    <h1>{item.name}</h1>

                    <p className="item-descricao">
                      {item.description && item.description.length > 100?
                        `${item.description.substring(0, 100)}...`
                        :
                        item.description
                      }
                    </p>

                    {item.topics.length > 0 &&
                      <ul className="lista-topicos-repositorio">
                        {item.topics.map((topico, key)=>{
                          return (
                            <li key={key}>
                                {topico}
                            </li>     
                          )
                        })}
                      </ul>
                    }
                  
                    <div className="informacoes-extras">

                      <div className="info usuario">
                        <div className="icone-info">
                            <FiUser />
                        </div>
                        {item.owner.login}
                      </div>

                      <div className="info">
                        <div className="icone-info">
                            <BsStarFill />
                        </div>
                        {item.stargazers_count}
                      </div>

                      {item.language &&
                        <div className="info">
                          <div className="icone-info">
                              <AiOutlineFile />
                          </div>
                          {item.language}        
                        </div>
                      }

                      {item.license &&
                        <div className="info">
                          {item.license.spdx_id} license
                        </div>
                      }

                      <div className="info">
                        <div>
                            {ultimaAtualizacaoRepositorio(item.updated_at)}
                        </div>
                      </div>


                        
                    </div>
                    


                </li>  
                )
                
              })
            }
              
          </ul>
        </section>
        
        {repositorios &&
          <PaginasRepositorios />
        }
        
        
      </section>
    )
}