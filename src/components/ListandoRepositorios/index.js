
import "./style.css";

import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Creators as repositoriosCreators } from "../../store/ducks/repositorios";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import { useHistory } from "react-router-dom";

function ListandoRepositorios() {
    const history = useHistory();
    const dispatch = useDispatch();

    const { listaRepositorios } = useSelector(state=>state.repositorios);


    function listandoTopicosRepositorio(topico, key) {
        // Retorna no máximo 5 tópicos
        if(key < 5) {
            return (
                <li className="repositorio-topico-item" key={key}>
                    {topico.replace("-", " ")}
                </li>
            )

        // o 6º tópico retorna 3 pontos
        } else if(key === 5){
            return (
                <li className="repositorio-topico-item" key={key}>
                    ...
                </li>
            )
        } else {
            return;
        }
    }


    function convertendoData(dataISO) {
        return `Updated ${moment(dataISO).fromNow()}`;
    }


    function irParaRotaDeDetalhe(repositorio){

        dispatch(repositoriosCreators.setRepositorioDetalhado(repositorio));

        const converteNome = repositorio.full_name.replace("/", "+");
        history.push(`/${converteNome}`);
    }


    return (
        <ul className="lista-repositorios">
            {listaRepositorios && listaRepositorios.items.map((repositorio, key)=>{
                return (
                    <li className="repositorio-item" key={key} onClick={()=>{
                        irParaRotaDeDetalhe(repositorio);
                    }}>

                        <h1 className="repositorio-nome">
                            {repositorio.full_name}
                        </h1>

                        <p className="repositorio-descricao">
                            { repositorio.description && repositorio.description.length > 100?
                                `${repositorio.description.substring(0, 100)}...`
                                :
                                repositorio.description
                            }
                        </p>

                        <ul className="repositorio-topicos">

                            {repositorio.topics.map((topico, key)=>{

                                return listandoTopicosRepositorio(topico, key);

                            })}
                        </ul>

                        <div className="mais-informacoes-repositorio">
                            <div className="repositorio-estrelas">

                                <div className="icone"><FontAwesomeIcon icon={faStar} /></div>
                                <span>{repositorio.stargazers_count}</span>

                            </div>
                            
                            <span className="repositorio-linguagem">
                                {repositorio.language}

                            </span>

                            {repositorio.license &&

                                <span className="repositorio-licenca">
                                    licença {repositorio.license.spdx_id}
                                </span>
                            }

                            {convertendoData(repositorio.updated_at)}
                            
                        </div>

                    </li>
                )
            })}
        </ul>
    )
}


export default ListandoRepositorios;