const main = document.querySelector('#telaPrincipal')
const concluidos = document.querySelector('#concluidos')
const body =  document.querySelector('#corpoPag');
const btn = document.querySelector('#btnMenu')
const novaTarefa = document.querySelector('#novaTarefa')
const A_FAZER = "Afazer"
const CONCLUIDO = "Concluido"
const EM_REALIZACAO = "EmRealizacao"
const  tarefas = []
const tarefasAF= []
const tarefasC = []
const tarefasEA =[]
let contenMenu = false
let boolAbrirConfig = false
let claro = true

btn.addEventListener( 'click', menuLateral)
body.addEventListener('keydown'  , function (e){
    if(e.key == 'Escape'){
        menuLateral()
    }
});

function menuLateral(){
    if (!contenMenu){
        const sec = document.createElement('section')
        let ul = document.createElement('ul')
        ul.setAttribute('type', 'none')
        sec.setAttribute('id', 'config')
        let link = ['Temas', 'Sair']
        for(let i = 0;i < link.length;i++ ){
            let li = document.createElement('li')
            li.setAttribute('class','itemMenu itemConfig')
            let a = document.createElement('a')
            a.textContent= link[i]
            a.href = '#'
            a.id=`config${i}`
            li.appendChild(a)
            ul.appendChild(li)           
        };
        
        
        sec.appendChild(ul)        
        main.appendChild(sec)
        contenMenu = true
        sec.setAttribute('id','menuLateral')
    }else if (contenMenu) {
        const sec2 = document.querySelector('#menuLateral')
        main.removeChild(sec2)
        contenMenu = false
    } 
    const configura  = document.querySelectorAll('.itemConfig')
    configura[0].addEventListener('click', ()=>{
        abrirConfig(configura[0],['Claro', 'Escuro'],boolAbrirConfig)
    })
    boolAbrirConfig = false
}

function abrirConfig(e, arr,bool){
    if(!bool){
        let ul = document.createElement('ul')
        ul.setAttribute('type','none')
        ul.setAttribute( 'id','opcoesTemas')
        
        for(let i=0; i < arr.length; i++){
            const temas = document.createElement('li')
            const a =document.createElement('a')
            temas.setAttribute('class', 'itemMenu')
            if(e === document.querySelectorAll('.itemConfig')[0]){
                temas.setAttribute('id',`temas${i}`)
                
            }
            if(e === document.querySelectorAll('.itemConfig')[0] && i == 0){
                a.addEventListener('click',(e) => {
                if (claro){
                let header  = document.getElementsByTagName('header')[0]
                header.style.backgroundColor='#049df5'
                main.style.backgroundColor='white'
                body.style.backgroundColor='white'
                let sections = main.querySelectorAll('.mainSec')
                for(let i = 0; i < sections.length; i++){
                    sections[i].style.backgroundColor = '#F4F3F3'
                    sections[i].style.color="black"
                }
                btn.style.backgroundColor = '#9ce8f4';
                
                }
            })}
            if(e === document.querySelectorAll('.itemConfig')[0] && i == 1){
                a.addEventListener('click',(e) => {
                if (claro){
                let header  = document.getElementsByTagName('header')[0]
                header.style.backgroundColor='rgb(15, 0, 83)'
                main.style.backgroundColor='rgba(2, 2, 2, 1)'
                body.style.backgroundColor='rgba(2, 2, 2, 1)'
                let sections = main.querySelectorAll('.mainSec')
                for(let i = 0; i < sections.length; i++){
                    sections[i].style.backgroundColor = 'rgba(50,50,50,.9)'
                    sections[i].style.color="white"
                }
                btn.style.backgroundColor = 'rgb(0, 64, 85)';
                
                }
            })}
            temas.append(a)
            temas.style.cursor='pointer'
            a.textContent = arr[i]
            ul.append(temas)
        }
        e.after(ul)
        if(e === document.querySelectorAll('.itemConfig')[0]){
            boolAbrirConfig = true
        }
    } else if(bool){
        const ul = document.querySelector( '#opcoesTemas' )
        ul.remove()
        if(e === document.querySelectorAll('.itemConfig')[0]){
            boolAbrirConfig = false
        }
    }

}
novaTarefa.addEventListener('click', () =>{
    divJanelaTarefa()
});


function divJanelaTarefa(tarefa){
    
    const divJanelaTarefa = document.createElement("div");
    divJanelaTarefa.id = "janelaTarefa";

    const divJanela = document.createElement("div");
    divJanela.className = "janela";

    const divJaHeader = document.createElement("div");
    divJaHeader.className = "jaHeader";
    const divVasia =  document.createElement("div");
    const h2 = document.createElement("h2");
    h2.textContent = "Crie sua nova tarefa aqui";

    const buttonFechar = document.createElement("button");
    buttonFechar.id = "fechar";
    buttonFechar.innerHTML = "<strong>&#10005;</strong>";

    const form = document.createElement("form");
    form.action = "src/Main.js";
    form.className = "containerJanela";

    const labelNomeTarefa = document.createElement("label");
    labelNomeTarefa.htmlFor = "tNome";
    labelNomeTarefa.id = "tNome";
    labelNomeTarefa.innerHTML = "<p>Nome da Tarefa:</p>";
    
    const inputNomeTarefa = document.createElement("input");
    inputNomeTarefa.type = "text";
    inputNomeTarefa.required = true;

    labelNomeTarefa.appendChild(inputNomeTarefa);

    const labelDescricao = document.createElement("label");
    labelDescricao.htmlFor = "descricao";
    labelDescricao.id = "tDescricao";

    const textareaDescricao = document.createElement("textarea");
    textareaDescricao.placeholder = "Adicionar descrição...";
    textareaDescricao.required = true;
    labelDescricao.appendChild(textareaDescricao);

    const labelEtapa = document.createElement("label");
    labelEtapa.htmlFor = "etapa";
    labelEtapa.id = "tEtapa";

    const pAdicionarEtapa = document.createElement("p");
    pAdicionarEtapa.textContent = "Adicionar uma etapa:";

    const inputEtapa = document.createElement("input");
    inputEtapa.type = "text";

    const buttonAdicionarEtapa = document.createElement("input");
    buttonAdicionarEtapa.type = "button";
    buttonAdicionarEtapa.value="Adicionar etapa";
    buttonAdicionarEtapa.id = "tAdicionar";
    

    labelEtapa.appendChild(pAdicionarEtapa);
    labelEtapa.appendChild(inputEtapa);
    labelEtapa.appendChild(buttonAdicionarEtapa);

    const labelEtapas = document.createElement("label");

    const divEtapas = document.createElement("div");
    divEtapas.id = "tetapas";

    const ulEtapas = document.createElement("ul");
    ulEtapas.setAttribute('type', 'none');
    ulEtapas.id = "listaEtapas";

    divEtapas.appendChild(ulEtapas);
    labelEtapas.appendChild(divEtapas);

    const labelSalvarTarefa = document.createElement("label");

    const buttonCriarTarefa = document.createElement("input");
    buttonCriarTarefa.type = "button";
    buttonCriarTarefa.value ="Criar Tarefa";
    buttonCriarTarefa.id = "criarTarefa";
    

    labelSalvarTarefa.appendChild(buttonCriarTarefa);
    divJaHeader.appendChild(divVasia);
    divJaHeader.appendChild(h2);
    divJaHeader.appendChild(buttonFechar);
    

    form.appendChild(labelNomeTarefa);
    form.appendChild(labelDescricao);
    form.appendChild(labelEtapa);
    form.appendChild(labelEtapas);
    form.appendChild(labelSalvarTarefa);

    divJanela.appendChild(divJaHeader);
    divJanela.appendChild(form);

    divJanelaTarefa.appendChild(divJanela);

    document.body.prepend(divJanelaTarefa);
    
    buttonFechar.addEventListener("click", () => { 
        divJanelaTarefa.remove();
    });

    
    //movimentações
    if(tarefa !== undefined){
        inputNomeTarefa.value = tarefa._titulo;
        textareaDescricao.value = tarefa._descricao;
        
        for(let i = 0; i < tarefa._etapas.length; i++){
            ulEtapas.innerHTML+= tarefa._etapas[i].outerHTML
        }
        buttonCriarTarefa.value = "Modificar Tarefa";
    }  

    buttonAdicionarEtapa.addEventListener("click", () =>{
        if(!inputEtapa.value.length == 0){
            let li =  document.createElement('li');
            let check= document.createElement('input')
            check.type='checkbox';
            check.className="check-etapa"
            check.addEventListener('focus', (e) => {
                e.target.parentNode.remove()
            }
            )
            li.prepend(check);
            li.append(inputEtapa.value)

            inputEtapa.value= "";

            ulEtapas.appendChild(li)
        } 
    }); 
    buttonCriarTarefa.addEventListener('click', (e)=>{
    if(tarefa !== undefined){
        tarefa._titulo =inputNomeTarefa.value
        tarefa._descricao = textareaDescricao.value
        tarefa._etapas = ulEtapas.childNodes
    }else{
        tarefa = new Tarefas(inputNomeTarefa.value,textareaDescricao.value,ulEtapas.childNodes, A_FAZER);
        tarefasAF.push(tarefa)}
        criarPostit(document.querySelector('#aFazer .mainSec2'),  tarefasAF, ['Editar', 'Excluir', 'Concluído', 'Em andamento'],A_FAZER)
        divJanelaTarefa.remove();
    })  
}
function criarPostit(caixa, vetorTarefa, opcoesVetor,id ){
    caixa.innerHTML=""
    for(let i = 0; i < vetorTarefa.length ;i++){
        const editar=[]
        const postit =  document.createElement( 'div');
        postit.setAttribute('class', `postits ${id}` )
        const  titulo = document.createElement ('h2');
        titulo.textContent = `${vetorTarefa[i]._titulo}`;
        const descricao = document.createElement('p');
        descricao.textContent=`${vetorTarefa[i]._descricao}`
        postit.appendChild(titulo)
        postit.appendChild(descricao)     
        caixa.appendChild(postit)
        
        
        mineMenu(opcoesVetor, postit, id)//Criar o menu da tarefa
        //Adicionando os eventos nos itens do menu
        for (var j = 0; j < opcoesVetor.length; j++){
            editar[j] =  postit.querySelector(`#${id}${j}`);
        }
        
        
        if(vetorTarefa == tarefasAF){
            //editar afazer
            editar[0].addEventListener('click', ()=>{
                divJanelaTarefa(vetorTarefa[i])
            });
                //Excluir
            editar[1].addEventListener('click', ()=>{
                postit.remove()
                vetorTarefa.splice(i, 1)//ta retornando conforme mexe no programa
            });
                //enviar par concluido
            editar[2].addEventListener('click', ()=>{
                
                tarefasC.push(vetorTarefa[i]);
                postit.remove()
                criarPostit(document.querySelector('#concluidos .mainSec2'),tarefasC,['Excluir'],CONCLUIDO);
                vetorTarefa.splice(i, 1)
                
            });
                //enviar para em andamento
            editar[3].addEventListener('click', ()=>{
                if(tarefasEA.length== 0){
                console.log(tarefasEA)
                console.log(tarefasEA.length)
                tarefasEA.push(vetorTarefa[i]);
                postit.remove();
                criarPostit(document.querySelector('#emAndamento .mainSec2'),tarefasEA,['Editar','Excluir','Concluido','A fazer'], EM_REALIZACAO);
                vetorTarefa.splice(i, 1)
                
                }else{
                    let espera  = document.createElement('p')
                    espera.setAttribute('style','color:red')
                    espera.className='espera'
                    espera.textContent= `Esperando a realização de outra tarefa`
                    postit.appendChild(espera)
                }
            });
        }else if(id == EM_REALIZACAO){
            editar[0].addEventListener('click', ()=>{
                divJanelaTarefa(vetorTarefa[i])
            });
            editar[1].addEventListener('click', ()=>{
                postit.remove()
                vetorTarefa.splice(i, 1)
                console.log(tarefasEA)
                console.log(tarefasEA.length)
            });
            editar[2].addEventListener('click', ()=>{
                tarefasC.push(vetorTarefa[i]);
                postit.remove();
                criarPostit(document.querySelector('#concluidos .mainSec2'),tarefasC,['Excluir'],CONCLUIDO);
                vetorTarefa.splice(i, 1)
                console.log(tarefasEA)
                console.log(tarefasEA.length)
            });
            editar[3].addEventListener('click', ()=>{
                tarefasAF.push(vetorTarefa[i]);
                postit.remove();
                criarPostit(document.querySelector('#aFazer .mainSec2'),  tarefasAF, ['Editar', 'Excluir', 'Concluído', 'Em andamento'],A_FAZER)
                vetorTarefa.splice(i, 1)
                console.log(tarefasEA)
                console.log(tarefasEA.length)
            });
        }else if(id == CONCLUIDO){
            editar[0].addEventListener('click', ()=>{
                postit.remove()
                vetorTarefa.splice(i, 1)
            });
        }
        if(caixa == document.querySelector('#emAndamento .mainSec2')){
            for(let y = 0;y < vetorTarefa[i]._etapas.length; y++){
                postit.appendChild(vetorTarefa[i]._etapas[y])
            }
        }
    }
}

//função de criação do menu que vai nos postitis
function mineMenu(opcoes, caixa, id){

        var divPrincipal = document.createElement('div');
        divPrincipal.classList.add('btn-group');
        divPrincipal.setAttribute('role', 'group');
        divPrincipal.setAttribute('id', 'drop1')
        divPrincipal.setAttribute('aria-label', 'Button group with nested dropdown');

        var divInterna = document.createElement('div');
        divInterna.classList.add('btn-group');
        divInterna.setAttribute('role', 'group');
        
        
        var botaoDropdown = document.createElement('button');
        botaoDropdown.setAttribute('type', 'button');
        botaoDropdown.classList.add('btn', 'btn-primary', 'dropdown-toggle');
        botaoDropdown.setAttribute('data-bs-toggle', 'dropdown');
        botaoDropdown.setAttribute('aria-expanded', 'false');

        var ulDropdown = document.createElement('ul');
        ulDropdown.classList.add('dropdown-menu');
        ulDropdown.setAttribute('id','drop')
    
        for (var i = 0; i < opcoes.length; i++) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.classList.add('dropdown-item');
            a.setAttribute('href', '#');
            a.textContent = opcoes[i];
            li.appendChild(a);
            li.setAttribute('id',`${id}${i}`)
            ulDropdown.appendChild(li);
            
        }

        // Montagem da estrutura
        botaoDropdown.textContent = ' '; // Adiciona um espaço ao botão para evitar que ele fique muito pequeno
        divInterna.appendChild(botaoDropdown);
        divInterna.appendChild(ulDropdown);
        divPrincipal.appendChild(divInterna);

        // Adiciona a div ao corpo do documento
        caixa.prepend(divPrincipal);
        
}
