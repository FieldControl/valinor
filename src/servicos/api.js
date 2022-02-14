
const BASE_API = "https://api.github.com/search";
const porPagina = 20;

// basicFetch faz uma requisição padrão e retorna os dados
const basicFetch = async (url) => await fetch(url).then(dados => dados.json());


export const apiRequisicoes = {

    async getRepositorios(textoPesquisa, pagina=0){
        const url =
        `${BASE_API}/repositories?q=${textoPesquisa}/&page=${pagina}&per_page=${porPagina}`;

        return basicFetch(url);
        
    },

    async getRepositorioPerfil(nomePerfil, nomeRepositorio){
        const urlRepo = `${BASE_API}/repositories?q=${nomePerfil}/${nomeRepositorio}&per_page=1`;
        const urlIssues = `${BASE_API}/issues?q=repo:${nomePerfil}/${nomeRepositorio}`;

        const dataRepo = await basicFetch(urlRepo);
        const dataIssues = await basicFetch(urlIssues);

        return {
            dataRepo,
            dataIssues
        };
    }
};
