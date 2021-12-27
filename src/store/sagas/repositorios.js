
import { call, put } from "redux-saga/effects";
import { getIssuesRepositorioApi, getRepositoriosAPI } from "../../services/apiGit";

import { Creators as repositoriosCreators } from "../ducks/repositorios";


export function* getRepositorios(dados) {
    // faz uma requisição GET para a api do github e retorna resultados

    const { textoDaPesquisa, page } = dados.payload;

    // faz a requisição
    const repositorios = yield call(getRepositoriosAPI, textoDaPesquisa, page);

    if(repositorios) {

        // adiciona os dados ao reducer
        yield put(repositoriosCreators.setPage(page? page : 1));
        yield put(repositoriosCreators.setRepositorios(repositorios));
    }
}


export function* getRepositorioDetalhado(dados) {
    const nomeRepositorio = dados.payload.nomeRepositorio;

    const repositorio = yield call(getRepositoriosAPI, nomeRepositorio);
    const issues = yield call(getIssuesRepositorioApi, nomeRepositorio);
    if(repositorio.items) {
        if(issues.items){
            yield put(repositoriosCreators.setRepositorioDetalhado(repositorio.items[0], issues.items));
        }
        else {
            yield put(repositoriosCreators.setRepositorioDetalhado(repositorio.items[0]));
        }
        
    }
}