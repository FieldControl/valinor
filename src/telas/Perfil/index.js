import React, { useLayoutEffect } from "react";
import "./style.css";

import GifLoader from "../../componentes/GifLoader";

import { Creators as perfilCreators } from "../../store/ducks/perfilData";
import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";

import InfoPerfil from "./componentes/InfoPerfil";
import RepositorioDetalhado from "./componentes/RepositorioDetalhado";


export default function Perfil() {

    const { perfil, repositorioPerfil } = useParams();
    const { load, dataRepo } = useSelector(state=>state.perfilData);

    const dispatch = useDispatch();

    useLayoutEffect(()=>{
        (function getRequisicaoUnicoRepositorio(){

            // setLoad false diz para o script que a requisição ainda não foi completada
            dispatch(perfilCreators.setLoad(false));

            if(repositorioPerfil) {
                // chamando creator de requisição
                dispatch(perfilCreators.getRepositorio(perfil, repositorioPerfil));
                
            } else {
                dispatch(perfilCreators.setLoad(true));
            }
        }());
    }, [dispatch, perfil, repositorioPerfil]);

    return (
        <section className="perfil">

            {!load &&
                <GifLoader />
            }

            {load && !dataRepo &&
                // Repositório Não foi encontrado
                <div className="sem-perfil">
                    Repositorio não encontrado
                </div>
            }

            {load && dataRepo &&
                <React.Fragment>
                    <InfoPerfil />

                    <RepositorioDetalhado />
                </React.Fragment>
            }
            
        </section>
    );
};