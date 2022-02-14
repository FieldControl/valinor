export const Types = {
    GET_REPOSITORIOS: "GET_REPOSITORIOS_ASYNC",

    SET_REPOSITORIOS: "SET_REPOSITORIOS",
    SET_LOAD: "SET_LOAD"
};

export const Creators = {
    getRepositorios: (textoPesquisa, pagina)=>({
        type: Types.GET_REPOSITORIOS,
        payload: {
            textoPesquisa,
            pagina
        }
    }),
    
    setDados: (dados)=>({
        type: Types.SET_REPOSITORIOS,
        payload: dados
    }),

    setLoad: (valor)=>({
        type: Types.SET_LOAD,
        payload: valor
    })
};

const STATE_INICIAL = {

    repositorios: null,
    pagina: 0,
    load: false
};

export default function reducer(state=STATE_INICIAL, { type, payload }) {
    switch(type) {
        case Types.SET_REPOSITORIOS:
            return {
                ...state,
                repositorios: payload,
            };

        case Types.SET_LOAD:
            return {
                ...state,
                load: payload
            }

        default:
            return state;
    };
};