export const Types = {
    GET_REPOSITORIO_PERFIL: "GET_REPOSITORIO_PERFIL_ASYNC",

    SET_REPOSITORIO_PERFIL: "SET_REPOSITORIO_PERFIL",
    SET_LOAD: "SET_LOAD"
}


export const Creators = {
    getRepositorio: (nomePerfil, nomeRepositorio)=>({
        type: Types.GET_REPOSITORIO_PERFIL,
        payload: {
            nomePerfil,
            nomeRepositorio
        }
    }),

    setRepositorio: (repositorio)=>({
        type: Types.SET_REPOSITORIO_PERFIL,
        payload: repositorio
    }),

    setLoad: (valor)=>({
        type: Types.SET_LOAD,
        payload: valor
    })
}

const STATE_INICIAL = {
    dataRepo: null,
    dataIssues: null,
    load: true
}

export default function perfilData(state=STATE_INICIAL, { type, payload }) {
    switch(type) {
        
        case Types.SET_REPOSITORIO_PERFIL:
            return {
                ...state,
                dataRepo: payload.dataRepo.items[0],
                dataIssues: payload.dataIssues.items
            }

        case Types.SET_LOAD:
            return {
                ...state,
                load: payload
            }

        default:
            return state;
    }
}