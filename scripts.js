const $modelo = document.getElementById('modelo');
const $descriptionInput = document.getElementById('description');
const $priorityInput = document.getElementById('priority');
const $deadlineInput = document.getElementById('deadline');
const $ColumnInput = document.getElementById('column');
const $idInput = document.getElementById("idInput");



const $creationModeTittle = document.getElementById('creationModeTittle')
const $editionModeTittle = document.getElementById('editionModeTittle')

const $creationModeBtn = document.getElementById('creationModeBtn')
const $editionModeBtn = document.getElementById('editionModeBtn')

var taskList = [];

function abrirModelo(data_column){ // função para mostrar o modelo mudando seu display para flex
    $modelo.style.display = "flex";

        $ColumnInput.value = data_column;    
    
        $creationModeTittle.style.display="block";
        $creationModeBtn.style.display="block"; // aqui estou mudando o botão para criar ou editar

        $editionModeTittle.style.display="none";
        $editionModeBtn.style.display="none";
    
}

function abrirModeloParaEditar(id){
    $modelo.style.display = "flex";

    
        $creationModeTittle.style.display="none";
        $creationModeBtn.style.display="none";

        $editionModeTittle.style.display="block";
        $editionModeBtn.style.display="block";

        const index = taskList.findIndex(function(task){ // localizando o index(card)
            return task.id == id;
        });
        
        const task = taskList[index]; // colocando em uma variavel 

        $idInput.value = task.id; 
        $descriptionInput.value = task.descripton;
        $priorityInput.value = task.priority; //igualando valores
        $deadlineInput.value = task.deadline;  
        $ColumnInput.value = task.column;      
   
}

function changeColumn(task_id, column_id){
    if(task_id && column_id){
    taskList = taskList.map((task)=> {
        if(task_id != task.id) return task; //mudando o card de coluna pelo ID da task

        return{
            ...task,
            column: column_id,
        };
    });
}
generateCards();
}

function fecharModelo(){
    $modelo.style.display = "none"; // limpando campos quando o modelo é fechado
    
    $idInput.value = "";
    $descriptionInput.value = "";
    $priorityInput.value = "";
    $deadlineInput.value = "";
    $ColumnInput.value = "";
}

function resetColumns(){
    document.querySelector('[data-column="2"] .body .cards_list').innerHTML = '';
    document.querySelector('[data-column="3"] .body .cards_list').innerHTML = ''; // resetando colunas
    document.querySelector('[data-column="4"] .body .cards_list').innerHTML = '';
    document.querySelector('[data-column="1"] .body .cards_list').innerHTML = '';

}

function generateCards(){ // gerando o card com um codigo HTML

    resetColumns();

    taskList.forEach(function(task){ // para cada elemento da lista executa a funçao de gerar o card

        const columnBody = document.querySelector(`[data-column="${task.column}"] .body .cards_list`)
                    // interpolação de string para facilitar o codigo e colocar as variaveis
        const card = `
        <div 
        id="${task.id}"
        class="card" 
        ondblclick="abrirModeloParaEditar(${task.id})" // interpolação para facilitar o codigo e colocar as variaveis
        draggable="true"
        ondragstart="dragstartHandler(event)"
        > 
            <div class="info"> 
                <b>Descrição:</b>
                <span>${task.descripton}</span>
            </div>        
         
            <div class="info"> 
                <b>Prioridade:</b>
                <span>${task.priority}</span>
            </div>       
         
            <div class="info"> 
                <b>Prazo Final:</b>
                <span>${task.deadline}</span>
            </div>
        </div>
        `;

        columnBody.innerHTML += card;   
    });

    

}

function createTask(){ //criando a tarefa com um modelo improvisado de ID, não é a forma correta mas foi a forma
    //mais agil que pensei na hora para conseguir entregar o projeto, irei alterar para uma forma melhor em breve
    const newTask = {
        id: Math.floor(Math.random()*9999999),
        descripton: $descriptionInput.value,
        priority: $priorityInput.value,
        deadline: $deadlineInput.value,
        column: $ColumnInput.value,
        }
        taskList.push(newTask);

    fecharModelo();
    generateCards();

    
}

function updateTask(){ //atualizando os valores da task
    const task = {  
        id: $idInput.value,      
        descripton: $descriptionInput.value,
        priority: $priorityInput.value,
        deadline: $deadlineInput.value,
        column: $ColumnInput.value,
toDoList
        }

        const index = taskList.findIndex(function(task){
            return task.id == $idInput.value;
        });
        taskList[index] = task;
        fecharModelo();
        generateCards();
}


// essa parte achei na documentação e achei interessante colocar
    // foi feito as proximas 3 funçoes para poder mover a tarefa de coluna arrastando com o mouse

function dragstartHandler(ev) {
    
    ev.dataTransfer.setData("my_custom_data", ev.target.id);  
    ev.dataTransfer.effectAllowed = "move";
  }

  function dragoverHandler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
  }

  function dropHandler(ev) {
    ev.preventDefault();  
    const task_id = ev.dataTransfer.getData("my_custom_data");
    const column_id = ev.target.dataset.column;

    changeColumn(task_id, column_id)   
    
  }
  


