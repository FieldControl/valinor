import { call, put } from "redux-saga/effects";

import { apiRequisicoes } from "../../servicos/api";

import { Creators as perfilCreators } from "../ducks/perfilData";


export function* getRepositorioPerfil(dados) {
    const { nomePerfil, nomeRepositorio } = dados.payload;

    const {dataRepo, dataIssues} = yield call(apiRequisicoes.getRepositorioPerfil, nomePerfil, nomeRepositorio);

    if(dataRepo.total_count > 0) {
        yield put(perfilCreators.setRepositorio({dataRepo, dataIssues}));
    };

    yield put(perfilCreators.setLoad(true));
};