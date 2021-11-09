(function(){
    'use strict';

    const $find = document.querySelector('#find');
    
    let $data = '';
    
    const showContent = document.querySelector('#content');
    const button = document.querySelector('button');
    button.addEventListener('click', search);

    // Criando o elemento do Loading
    const divImg = document.createElement('div');
    divImg.className = "mx-auto ";
    divImg.id = 'loading';

    const img = document.createElement('img');
    img.src = 'loading.gif';

    // Criando o elemento para apresentar quando não encontrar
    const searchNotFound = document.createElement('div');
    searchNotFound.className = "mt-5 mx-auto"


    // Faz a requisição da API 
    function search(){

        // A cada nova pesquisa, o 'showContent' é limpo
        showContent.innerHTML = '';

        // Aplicando um loadind
        if(!document.querySelector('#loading')){
            showContent.appendChild(divImg);
            divImg.appendChild(img);
        }
        
        fetch(`https://api.github.com/search/repositories?q=${$find.value}`)
        .then(res => {res.json()
        .then(data => walks(data))
        })
        .catch(err => showContent.innerHTML = "ERRO")
    }

  
    function walks(data){

        // Remove o Loading
        showContent.removeChild(divImg);
        $data = data.items;

        // Verifica se o valor dentro de '$data' é igual a zero, ou seja não tem valores para essa pesquisa
        if($data.length === 0){
            showContent.appendChild(searchNotFound);
            searchNotFound.innerHTML = `<h2 class='text-danger'>Nenhum resultado encontrado para: "${$find.value}".</h2>`;    
        }

        
        createDiv($data);

        
        lengthParagraph();

        
        window.addEventListener('scroll', scroll.view);
    }


    // Estabelece um limite para o tamanho dos paragrafos
    function lengthParagraph(){

        const paragraphs = document.querySelectorAll('div h4 p');
        paragraphs.forEach((e) => {

            if(e.textContent.length > 23){
                
                e.innerHTML = `${e.textContent.slice(0, 23)}...`;
            }
        })
    }

    // Cria os elementos para apresentar no 'showContent'
    function createDiv(dados){
        for(let c in dados){
            

            let div = document.createElement('div');
            div.className = 'col-sm-12 col-md-4 text-center p-5 mt-5 mb-5';

            let imgUser = document.createElement('img');
            imgUser.classList.add('rounded-circle');
            imgUser.src = dados[c].owner.avatar_url;
            imgUser.width = '80';

            let nameUser = document.createElement('h4');
            nameUser.classList.add('mt-2');
            nameUser.innerHTML = `Repositório:<br> <p style="font-weight: 400;">${dados[c].name}</p>`;
            console.log(nameUser)

            let repoPublic = document.createElement('a');
            let url = dados[c].git_url.replace('git://', '');
            repoPublic.textContent = 'Acessar repositório';
            repoPublic.href = `https://${url}`;
            repoPublic.target = "blank";

            
            showContent.appendChild(div);
            div.appendChild(imgUser);
            div.appendChild(nameUser);
            div.appendChild(repoPublic);
        }
    }

      
    // Monitora o scroll
    let scroll = {
        
        top(){
            window.scroll({
                top: 0,
                behavior: 'smooth'
            })
        },
        
        view(){
            let positionScroll = window.pageYOffset;
            if(positionScroll > 60){
                document.querySelector('#scroll-top').style.opacity = 1;
                document.querySelector('#scroll-top').addEventListener('click', scroll.top);
            }else{
                document.querySelector('#scroll-top').style.opacity = 0;
                
            }
        }
    }

    
})();