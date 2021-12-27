
const API_BASE = "https://api.github.com/search";

export async function getRepositoriosAPI(nomeRepositorio, page=1){

    // invertendo sinais para fazer requisição
    const formataTexto = nomeRepositorio.replace("+", "/");

    const urlPesquisa = `${API_BASE}/repositories?q=${formataTexto}/&per_page=10&page=${page}`;

    // fazendo a requisição à api do github
    const data = await fetch(urlPesquisa)
        .then(data=>data.json());
          
    if(data.items) {
        return data;

    } else {
        // a api fornece um número limitado de requisições, então adicionei essa mensagem 
        // genérica caso exceda xD
        alert("Verifique sua conexão com a internet e tente novamente!");
    }
}


export async function getIssuesRepositorioApi(nomeRepositorio) {
    const formataTexto = nomeRepositorio.replace("+", "/");
    const urlPesquisa = `https://api.github.com/search/issues?q=repo:${formataTexto}/`;

    const data = await fetch(urlPesquisa)
        .then(data=>data.json());

    if(data) {
        return data;
    }
}
