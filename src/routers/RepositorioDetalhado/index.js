import React, { useLayoutEffect } from "react";
import "./style.css";
import forkIcon from "../../assets/forkIcon.png";

import { faStar, faEye, faCode, faBalanceScale, faCommentAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Creators as repositoriosCreators } from "../../store/ducks/repositorios";
import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";

import moment from "moment";

function RepositorioDetalhado() {

    const { nomeRepoParametro } = useParams();

    
    const {repositorioDetalhado: repositorio, issuesRepoDetalhado: issues} = useSelector(
        state=>state.repositorios
    );

    const dispatch = useDispatch();

    useLayoutEffect(()=>{
        if(!repositorio || !issues) {
            dispatch(repositoriosCreators.getRepositorioDetalhado(nomeRepoParametro));
        }
    }, []);

    function convertendoData(dataISO) {
        return `Updated ${moment(dataISO).fromNow()}`;
    }

    return (
        <section className="repositorio-detalhe">
            {repositorio &&
                <React.Fragment>
                    <article className="info-basica-perfil">
                        <img 
                            className="imagem-usuario-repositorio" 
                            src={repositorio.owner.avatar_url} 
                            rel="imagem de perfil"
                        />
                        <p className="nome-usuario">
                            {repositorio.owner.login}
                        </p>
                    </article>


                    <div className="area-repositorio">
                        <div className="area-esquerda">
                            <h1 className="nome-detalhe">{repositorio.name}</h1>
                            <p className="descricao-detalhe">{repositorio.description}</p>

                            <ul className="lista-tags-detalhe">
                                {repositorio.topics.map((topico, key)=>{
                                    return (
                                        <li key={key}>
                                            <a target="_blank" href={`https://github.com/topics/${topico}`}>
                                                {topico}
                                            </a>
                                        </li>
                                    )
                                })}
                                
                            </ul>
                        </div>

                        <div className="area-direita">

                            <div className="direita-item data">
                                {convertendoData(repositorio.update_at)}
                            </div>

                            <div className="direita-item estrelas">
                                <span className="star">
                                    <FontAwesomeIcon icon={faStar} />
                                </span>
                                {repositorio.stargazers_count}

                            </div>

                            <div className="direita-item viewers">
                                <span className="eye">
                                    <FontAwesomeIcon icon={faEye} />
                                </span>
                                {repositorio.watchers_count}

                            </div>
                            
                            <div className="direita-item forks">
                                <span className="fork">
                                    <img src={forkIcon} />
                                </span>
                                {repositorio.forks_count}
                                
                            </div>

                            {repositorio.language &&
                                <div className="direita-item linguagem">
                                    <span className="language">
                                        <FontAwesomeIcon icon={faCode} />
                                    </span>
                                    {repositorio.language}
                                </div>
                            }

                            {repositorio.license &&
                                <div className="direita-item licenca">
                                    <span className="license">
                                        <FontAwesomeIcon icon={faBalanceScale} />
                                    </span>
                                    licença {repositorio.license.spdx_id}

                                </div>
                            }

                        </div>
                        
                    </div>

                    {issues && issues.length > 0 &&
                        <div className="area-issues">
                            <h2>Issues</h2>
                            
                            <div className="lista-issues">
                                {issues.map((itemIssue, key)=>{
                                    if(itemIssue.state === "open") {
                                        return (
                                            <div className="item-issue" key={key}>
                                                <span>{itemIssue.title}</span>
                                                <div className="comentarios">
                                                    <span>
                                                        <FontAwesomeIcon icon={faCommentAlt} />
                                                    </span>
                                                    <span>
                                                        {itemIssue.comments}
                                                    </span>
                                                        
                                                </div>
                                            </div>
    
                                        )
                                    }
                                })
                                    
                                }
                            </div>
                        </div>
                    }
                    {issues && issues.length === 0 &&
                        <div className="area-sem-issues">
                            <h2>Issues</h2>
                            <span className="sem-issues">
                                Esse repositório não possui issues :(
                            </span>
                        </div>
                    }
                    

                </React.Fragment>
                
                
            }
        </section>
    )
}


export default RepositorioDetalhado;