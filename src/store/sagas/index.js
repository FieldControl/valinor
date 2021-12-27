import { takeLatest, all } from "redux-saga/effects";

import { Types } from "../ducks/repositorios";

import { getRepositorios, getRepositorioDetalhado } from "./repositorios";


export default function* rootSagas(){
    return yield all([
        takeLatest(Types.GET_REPOSITORIOS, getRepositorios),
        takeLatest(Types.GET_REPOSITORIO_DETALHADO, getRepositorioDetalhado),
    ])
}