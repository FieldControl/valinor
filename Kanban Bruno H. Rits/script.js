const $modal = document.getElementById('modal');
const $descriptionInput = document.getElementById('description');
const $priorityInput = document.getElementById('priority');
const $deadlineInput = document.getElementById('deadline');
const $idInput = document.getElementById("idInput")

const $todoColumnBody = document.querySelector('#todoColumn .body')

const $creationModeTitle = document.getElementById('creationModeTitle');
const $editingModeTitle = document.getElementById('editingModeTitle');

const $creationModeBtn = document.getElementById('creationModeBtn');
const $editingModeBtn = document.getElementById('editingModeBtn');
var todoList = [];
 
function openModal (id) {
    $modal.style.display = "flex";

    if(id) {
        $creationModeTitle.style.display = "none";
        $creationModeBtn.style.display = "none";

        $editingModeTitle.style.display = "block";
        $editingModeBtn.style.display = "block";

        const index = todoList.findIndex(function(task) { 
            return task.id= id;
        })

        const task = todoList [index];

        $idInput.value= task.id; 
        $descriptionInput.value= task.description;
        $priorityInput.value= task.priority;
        $deadlineInput.value= task.deadline;

        
    }
    else{
        $creationModeTitle.style.display = "block";
        $creationModeBtn.style.display = "block";
        
        $editingModeTitle.style.display = "none";
        $editingModeBtn.style.display = "none"; 
        }
}
function closeModal () {
    $modal.style.display = "none";

    $idInput.value = "";
    $descriptionInput.value="";
    $priorityInput.value="";
    $deadlineInput.value="";
}

function generateCards () {
    const todoListHtml = todoList.map(function(task) {
        const formattedDate= moment (task.deadline) .format ('DD/MM/YYYY');
        return `
        <div class="card" ondblclick= "openModal(${task.id})">
            <div class="inf">
                <b>Descrição:</b>
                <span>${task.description}</span>
            </div>

            <div class="inf">
                <b>Prioridade:</b>
                <span>${task.priority}</span>
            </div>

            <div class="inf">
                <b>Prazo:</b>
                <span>${formattedDate}</span>
            </div>
        </div>
        `;
    })

    $todoColumnBody.innerHTML = todoListHtml.join('')
}

function createTask() {
    const newTask = {
        id: Math.floor(Math.random()*9999999 ),
        description: $descriptionInput.value,
        priority: $priorityInput.value,
        deadline: $deadlineInput.value 
    }

    todoList.push(newTask);

    closeModal();

    generateCards();

}

function updatetask() {
    const task = {
        id: $idInput.value,
        description: $descriptionInput.value,
        priority: $priorityInput.value,
        deadline: $deadlineInput.value, 
    }
    const index = todoList.findIndex(function(task) { 
        return task.id = $idInput.value;
    });

    todoList[index] = task;

    closeModal();
    generateCards();
}