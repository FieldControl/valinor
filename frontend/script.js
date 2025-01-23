const $modal = document.getElementById('modal');
const $descriptionInput = document.getElementById('description');
const $priorityInput = document.getElementById('priority');
const $deadLineInput = document.getElementById('deadLine');
const $columnInput = document.getElementById('column');
const $idInput = document.getElementById('idInput');
const $creationModeTitle = document.getElementById('creationModeTitle');
const $editionModeTitle = document.getElementById('editionModeTitle');
const $editionModeBtn = document.getElementById('editionModeBtn');
const $creationModeBtn = document.getElementById('creationModeBtn');

const API_URL = 'http://localhost:3000/tasks';

let taskList = [];

async function openModal(column) {
    $modal.style.display = "flex";
    $creationModeBtn.style.display = "block";
    $editionModeBtn.style.display = "none";
    $creationModeTitle.style.display = "block";
    $editionModeTitle.style.display = "none";
    document.querySelector('.delete-btn').style.display = "none";

    $columnInput.value = column;
    $idInput.value = '';
    $descriptionInput.value = '';
    $priorityInput.value = 'Baixa';
    $deadLineInput.value = '';
}


async function openModalToEdit(id) {
    $modal.style.display = "flex";
    $creationModeBtn.style.display = "none";
    $editionModeBtn.style.display = "block";
    $creationModeTitle.style.display = "none";
    $editionModeTitle.style.display = "block";
    document.querySelector('.delete-btn').style.display = "block";

    const task = await fetchTask(id);

    $idInput.value = task.id;
    $descriptionInput.value = task.description;
    $priorityInput.value = task.priority;
    $deadLineInput.value = task.deadline;
    $columnInput.value = task.column;
}


async function deleteTask() {

    const taskId = $idInput.value;
    const confirmDelete = window.confirm("Tem certeza de que deseja excluir esta tarefa?");

    if (confirmDelete) {

        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            
            taskList = taskList.filter(task => task.id != taskId);

            closeModal();
            generateCards();

        } else {
            alert("Erro ao excluir a tarefa.");
        }
    }
}


async function fetchTask(id) {
    const response = await fetch(`${API_URL}/${id}`); 
    if (response.ok) {
        return response.json();
    } else {
        throw new Error(`Task with id ${id} not found`);
    }
}

async function closeModal() {
    $modal.style.display = "none";
    $idInput.value = '';
    $descriptionInput.value = '';
    $priorityInput.value = '';
    $deadLineInput.value = '';
    $columnInput.value = '';
}

async function generateCards() {
    const columns = document.querySelectorAll('.column .body');
    columns.forEach(column => {
        const cardsList = column.querySelector('.cards-list');
        cardsList.innerHTML = '';
    });

    for (let task of taskList) {
        const columnBody = document.querySelector(`[data-column="${task.column}"] .body .cards-list`);
        const card = `
        <div class="card" id="card-${task.id}" draggable="true" ondragstart="drag(event)" ondblClick="openModalToEdit(${task.id})">
            <div class="info"><b>Descrição:</b><span>${task.description}</span></div>
            <div class="info"><b>Prioridade:</b><span>${task.priority}</span></div>
            <div class="info"><b>Prazo:</b><span>${task.deadline}</span></div>
        </div>
        `;
        columnBody.innerHTML += card;
    }
}

async function createTask() {
    const newTask = {
        description: $descriptionInput.value,
        priority: $priorityInput.value,
        deadline: $deadLineInput.value,
        column: $columnInput.value,
    };

    const response = await fetch(API_URL, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
    });

    if (response.ok) {
        const task = await response.json();
        taskList.push(task);
        closeModal();
        generateCards();
    }
}

async function updateTask() {
    const updatedTask = {
        id: $idInput.value,
        description: $descriptionInput.value,
        priority: $priorityInput.value,
        deadline: $deadLineInput.value,
        column: $columnInput.value,
    };

    const response = await fetch(`${API_URL}/${updatedTask.id}`, { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
        const task = await response.json();
        const index = taskList.findIndex(t => t.id == task.id);
        taskList[index] = task;
        closeModal();
        generateCards();
    }
}

async function drag(event) {
    event.dataTransfer.setData("taskId", event.target.id);
    event.target.classList.add('over');
}

async function allowDrop(event) {
    event.preventDefault();
    event.target.classList.add('droppable');
}

async function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const card = document.getElementById(taskId);
    const column = event.target.closest('.column');
    
    const targetColumnId = column.getAttribute('data-column');
    const task = taskList.find(t => t.id == taskId.replace('card-', ''));
    task.column = targetColumnId;

    const response = await fetch(`${API_URL}/${task.id}`, {  
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });

    if (response.ok) {
        card.classList.remove('over');
        generateCards();
    }
}

document.querySelectorAll('.column .body').forEach(body => {
    body.addEventListener('dragover', allowDrop);
    body.addEventListener('drop', drop);
});

async function loadTasks() {
    const response = await fetch(API_URL); 
    if (response.ok) {
        taskList = await response.json();
        generateCards();
    }
}

window.onload = loadTasks;
