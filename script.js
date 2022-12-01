
const url = 'https://api.github.com/users/FerreiraJoao1996/repos'
const container = document.querySelector(".container");
const returnSearch = document.querySelector(".return-search")
const search = document.querySelector("input[type='search']")
const items = [];

function getApi(){


    // HABILITANDO O CAMPO DE BUSCA

    function addHTML(repository){
         const div = document.createElement("div")
            div.innerHTML = repository 
            returnSearch.appendChild(div)

    }
    
    fetch(url)
    .then((dados) => dados.json())
        .then((repositories) => {
                repositories.forEach(repository => {
                    addHTML(repository.name.link(repository.html_url));
                    items.push(repository.name.link(repository.html_url))
                });
            })
   
            
    search.oninput= () => {
        
        returnSearch.innerHTML = "";
        returnSearch.style.display = "flex"
        items.filter((item) => item.toLowerCase().includes(search.value.toLowerCase())
        ).forEach((item) => addHTML(item))

    
    }     
    
    
    // CONSUMINDO A API E REALIZANDO PAGINAÇÃO DO CONTEUDO
    
        fetch(url)
            .then(async res=> {
                if(!res.ok){
                    throw new Error(res.status)} 
    
                let data = await res.json();
                        data.map(item => { 
                    })


let porPagina = 4

const estado = {
    pagina: 1,
    totalPaginas: Math.ceil(data.length / porPagina),
    botoesMaximos: 4
}

const html = {
    get(element){
        return document.querySelector(element)
    }
}

const controles = {
    proxima() {
        estado.pagina++
        const ultimaPagina = estado.pagina > estado.totalPaginas

        if(ultimaPagina){
            estado.pagina --
        }
    },

    anterior(){
        estado.pagina--

        if(estado.pagina < 1){
            estado.pagina ++
        }
    },

    ir(pagina) {
        estado.pagina = parseInt(pagina)

        if(estado.pagina < 1){
            estado.pagina = 1
        }

        if(pagina > estado.totalPaginas){
            estado.pagina = estado.totalPaginas
        }

       
    },

    controleDeEventos(){
        html.get(".primeiro").addEventListener("click", () => {
                controles.ir(1)
                update()
        })

        html.get(".ultima").addEventListener("click", () => {
            controles.ir(estado.totalPaginas)
            update()
    })
        html.get(".proxima").addEventListener("click", () => {
            controles.proxima()
            update()
    })
        html.get(".anterior").addEventListener("click", () => {
            controles.anterior()
            update()
    })
    }
            
}
controles.controleDeEventos()

const popularLista = {
    criar(item){
        let subContainer = document.createElement("div")
                    subContainer.innerHTML = `<div class="sub-container">
                <div>
                        <h3 class="title">${item.name}</h3>
                            <span class="data">${ Intl.DateTimeFormat('pt-BR').format(new Date(item.created_at)) }</span>
                    </div>
                <div>
                        <a href="${item.html_url}" target="_blank">${item.html_url}</a>
                            <span class="language"><span class="circle"></span>${item.language}</span> 
                            
                    </div>`

                    container.appendChild(subContainer)
    },

    update(){
        html.get(".container").innerHTML = ""

        let pagina = estado.pagina - 1
        let inicio = pagina * porPagina
        let final = inicio + porPagina

        const itensNaPagina = data.slice(inicio, final)
        
        itensNaPagina.forEach(popularLista.criar)
    }
} 

const botoes = {
    criar (numero){
        const button = document.createElement("div")

        button.innerHTML = numero

        button.addEventListener("click", (e) => {
            const pagina = e.target.innerHTML
            controles.ir(pagina)
            update()
        })

        html.get(".paginacao .numeros").appendChild(button)
    },

    update (){
        html.get(".paginacao .numeros").innerHTML = ""

        const {esquerda, direita} = botoes.botoesVisiveis()

        for(let pagina = esquerda; pagina <= direita; pagina++){
            botoes.criar(pagina)
        }
       
    },

    botoesVisiveis(){
        const {botoesMaximos} = estado

        let esquerda = (estado.pagina - Math.floor(botoesMaximos / 2))
        let direita = (estado.pagina + Math.floor(botoesMaximos / 2))

        if(esquerda < 1){
            esquerda = 1
            direita = botoesMaximos
        }

        if(direita > estado.totalPaginas){
            esquerda = estado.totalPaginas - (estado.botoesMaximos - 1)
            direita = estado.totalPaginas

            if(esquerda < 1) esquerda = 1
        }



        return {direita, esquerda}
    }
}


function update(){
    popularLista.update()
    botoes.update()
}

function iniciar(){
    update()
    controles.controleDeEventos()
}




iniciar()
})
        
}
getApi()