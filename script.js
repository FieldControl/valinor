function getValue(){
    let value = document.querySelector("#input_search").value//pega o valor do input
    document.querySelector('div .animate').classList.add('hidden')//esconde o gif
    document.querySelector('div .result_search').classList.remove('hidden')//mostra o resultado
    let url = getUtlGitHub(value)//pega a url
    getGitHubProfileInfos(url)//chama a função
    limpar()//limpa o input
    
}
function limpar(){
    document.querySelector("#input_search").value = ("")//limpa o input
    document.querySelector(".result_search").innerHTML = ""//limpa o resultado
}
function getUtlGitHub(value){
    const url = `https://api.github.com/search/repositories?q=${value}`
    return url

}
function getGitHubProfileInfos(url){
    fetch(url)//fetch é uma função que faz requisição
    .then(response => response.json())//transforma em json
    .then(data => {//pega os dados

        for(let i = 0; i < 10; i++){//percorre os dados
            let fullname = data.items[i].full_name//pega o nome completo
            let description = data.items[i].description//pega a descrição
            let watchers = data.items[i].watchers//pega os watchers
            let language = data.items[i].language//pega o language
            let forks = data.items[i].forks//pega os forks
            let html_url = data.items[i].html_url//pega o html_url  
        
            document.querySelector(".result_search").innerHTML +=(//mostra os dados na tela
                `<section>
                <div id="fullname">
                    <div>
                        <h3><a href="${html_url}" target="_blank">${fullname}</a></h3>
                    </div>
                </div>
                <div id="description">
                    <div>
                    <h4>Description</h4>${description}
                    </div>
                </div>
                <div id="stars">
                    <div>
                    <i class="icon-stars"></i>${watchers}
                    </div>
                </div>
                <div id="language">
                    <div>
                    <i class="icon-language"></i>${language}
                    </div>
                </div>
                <div id="fork">
                    <div>
                    <i class="icon-fork"></i>${forks}
                    </div>
                </div>
            </section>`
            );
        }
    })
}


