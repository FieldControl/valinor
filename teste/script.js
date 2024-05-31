// script.js

let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target;
    setTimeout(() => {
        event.target.classList.add("hide");
    }, 0);
}

function dragEnd(event) {
    event.target.classList.remove("hide");
    const placeholders = document.querySelectorAll(".task-placeholder");
    placeholders.forEach(placeholder => placeholder.remove());
    draggedItem = null;
    saveTasks();
}

function dragOver(event) {
    event.preventDefault();
    const target = event.target;
    if (target.className.includes("task")) {
        const rect = target.getBoundingClientRect();
        const next = (event.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        target.parentNode.insertBefore(draggedItem, next ? target.nextSibling : target);
    } else if (target.className.includes("task-list")) {
        target.appendChild(draggedItem);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const target = event.target;
    if (target.className.includes("task-list")) {
        target.appendChild(draggedItem);
        saveTasks();
    }
}

document.querySelectorAll(".task-list").forEach(column => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("drop", drop);
});

function addTask(columnId) {
    const taskText = prompt("Enter task description:");
    if (taskText) {
        const prioritySelect = document.getElementById("priority-select");
        const priority = prioritySelect.value;

        const task = document.createElement("div");
        task.className = "task";
        task.textContent = taskText;
        task.draggable = true;

        task.addEventListener("dragstart", dragStart);
        task.addEventListener("dragend", dragEnd);
        
        // Permitir edição do texto da tarefa
        task.addEventListener("dblclick", function() {
            const newText = prompt("Edit task description:", task.textContent);
            if (newText) {
                task.textContent = newText;
                saveTasks();
            }
        });

        // Adicionar botão de exclusão
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "×";
        deleteButton.onclick = function() {
            task.remove();
            saveTasks();
        };
        task.appendChild(deleteButton);

        // Definindo classe de prioridade
        if (priority === "simple") {
            task.classList.add("task-priority-simple");
        } else if (priority === "medium") {
            task.classList.add("task-priority-medium");
        } else if (priority === "high") {
            task.classList.add("task-priority-high");
        } else {
            task.classList.add("task-priority-simple"); // Por padrão, definido como simples
        }

        document.getElementById(columnId).appendChild(task);
        saveTasks();
    }
}

function saveTasks() {
    const columns = document.querySelectorAll(".task-list");
    const tasks = {};

    columns.forEach(column => {
        tasks[column.id] = [];
        const taskElements = column.querySelectorAll(".task");
        taskElements.forEach(taskElement => {
            tasks[column.id].push({
                text: taskElement.textContent.replace("×", "").trim(),
                priority: Array.from(taskElement.classList).find(cls => cls.startsWith("task-priority-"))
            });
        });
    });

    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("kanbanTasks"));
    if (tasks) {
        for (const columnId in tasks) {
            tasks[columnId].forEach(taskData => {
                const task = document.createElement("div");
                task.className = "task";
                task.textContent = taskData.text;
                task.draggable = true;

                // Definindo classe de prioridade
                task.classList.add(taskData.priority);

                task.addEventListener("dragstart", dragStart);
                task.addEventListener("dragend", dragEnd);

                // Permitir edição do texto da tarefa
                task.addEventListener("dblclick", function() {
                    const newText = prompt("Edit task description:", task.textContent);
                    if (newText) {
                        task.textContent = newText;
                        saveTasks();
                    }
                });

                // Adicionar botão de exclusão
                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-button";
                deleteButton.textContent = "×";
                deleteButton.onclick = function() {
                    task.remove();
                    saveTasks();
                };
                task.appendChild(deleteButton);

                document.getElementById(columnId).appendChild(task);
            });
        }
    }
}

// Inicializa o SortableJS para cada coluna
const columns = document.querySelectorAll(".task-list");

columns.forEach(column => {
    new Sortable(column, {
        group: "shared",
        animation: 150,
        ghostClass: 'sortable-ghost'
    });
});

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = 'Are you sure you want to leave?';
});

window.addEventListener('DOMContentLoaded', loadTasks);
