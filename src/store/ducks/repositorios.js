export const Types = {
    GET_REPOSITORIOS: "GET_REPOSITORIOS_ASYNC",
    GET_REPOSITORIO_DETALHADO: "GET_REPOSITORIO_DETALHADO",

    SET_TEXTO_PESQUISA: "SET_TEXTO_PESQUISA",
    SET_PAGE: "SET_PAGE",
    SET_REPOSITORIOS: "SET_REPOSITORIOS",
    SET_REPOSITORIO_DETALHADO: "SET_REPOSITORIO_DETALHADO"
}

export const Creators = {

    getRepositorios: (textoDaPesquisa, page)=>({
        // Essa Creator só é chamada através da pesquisa
        // Chama o Saga que faz a requisição à api

        type: Types.GET_REPOSITORIOS,
        payload: {
            textoDaPesquisa,
            page
        }
    }),

    getRepositorioDetalhado: (nomeRepositorio)=>({
        type: Types.GET_REPOSITORIO_DETALHADO,
        payload: {
            nomeRepositorio
        }
    }),

    setTextoPesquisa: (textoPesquisa)=>({
        type: Types.SET_TEXTO_PESQUISA,
        payload: textoPesquisa
    }),

    setPage: (paginaNumero)=>({
        type: Types.SET_PAGE,
        payload: paginaNumero
    }),

    setRepositorios: (repositorios)=>({
        // chamada pelo Saga para setar os repositórios no reducer
        type: Types.SET_REPOSITORIOS,
        payload: repositorios
    }),

    setRepositorioDetalhado: (repositorio, issues)=>({
        type: Types.SET_REPOSITORIO_DETALHADO,
        payload: {
            repositorio,
            issues
        }
    })

}

const STATE_INICIAL = {
    textoPesquisa: "",
    paginaAtual: null,
    listaRepositorios: null,
    repositorioDetalhado: null,
    issuesRepoDetalhado: null
}

function repositorios(state=STATE_INICIAL, {type, payload}){
    switch(type) {
        case Types.SET_TEXTO_PESQUISA:
            return {
                ...state,
                textoPesquisa: payload
            };

        case Types.SET_PAGE:
            return {
                ...state,
                paginaAtual: payload
            }
            
        case Types.SET_REPOSITORIOS:

            return {
                ...state,
                listaRepositorios: payload
            }

        case Types.SET_REPOSITORIO_DETALHADO:
            return {
                ...state,
                repositorioDetalhado: payload.repositorio,
                issuesRepoDetalhado: payload.issues
            }

        default:
            return state;
    }
}

export default repositorios;