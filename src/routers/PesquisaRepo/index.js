import React, { useLayoutEffect } from "react";
import "./style.css";


import FormularioPesquisa from "../../components/FormularioPesquisa";
import ListandoRepositorios from "../../components/ListandoRepositorios";
import PaginacaoRepositorios from "../../components/PaginacaoRepositorios";

import { useDispatch, useSelector } from "react-redux";
import { Creators as repositoriosCreators } from "../../store/ducks/repositorios";

import { useParams } from "react-router-dom";

function PesquisaRepo() {
    
    const { pesquisaParametro, page } = useParams();
    
    const listaRepositorios = useSelector(state=>state.repositorios.listaRepositorios);
    const dispatch = useDispatch();


    function getRequisicaoRepositorios() {

        if(page) {
            const numeroInteiroAnalise = /^[0-9]+$/;
            if(numeroInteiroAnalise.test(page)){

                dispatch(repositoriosCreators.setPage(page));
                dispatch(repositoriosCreators.getRepositorios(pesquisaParametro, page));
            }

        } else {
            dispatch(repositoriosCreators.getRepositorios(pesquisaParametro));
        }
    }

    useLayoutEffect(()=>{
        document.querySelector(".main").scrollTop = 0
        dispatch(repositoriosCreators.setTextoPesquisa(pesquisaParametro));

        getRequisicaoRepositorios();

    }, [pesquisaParametro, page]);

    return (
        <section className="conteudo-da-pesquisa">
            
            <div className="div-para-responsividade">
                <div className="area-de-pesquisa-repo">
                    <FormularioPesquisa />
                </div>
            </div>

            {listaRepositorios &&
                <ListandoRepositorios />
            }

            <div className="area-paginacao-resultados">
                <PaginacaoRepositorios />
            </div>
        </section>
    );
}

export default PesquisaRepo;