import { Component, OnInit } from '@angular/core';
import { TaskService } from './task.service';
import { Task } from './task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  tasks: Task[] = [];
  newTask: Task = { title: '', description: '', completed: false, status: 'OPEN'}; //Define o objeto newTask com os campos necessários

  // Injeta o serviço TaskService no construtor

  constructor(private taskService: TaskService) {}

  ngOnInit() { // Método chamado quando o componente é inicializado
    // Carrega as tarefas ao inicializar o componente
    this.loadTasks();
  }

  loadTasks() {

this.taskService.getTasks().subscribe(tasks => this.tasks = tasks);

}

  addTask(): void { // Adiciona uma nova tarefa
    // Verifica se o título e a descrição da nova tarefa estão preenchidos
    if (!this.newTask.title || !this.newTask.description) {
  console.warn('O título e a descrição são obrigatórios');
  return;
}

   this.taskService.addTask(this.newTask).subscribe((task: Task) => {
    this.tasks.push(task);
    this.newTask = { title: '', description: '', completed: false, status: 'OPEN' };
  });
}

  // Atualiza o status de uma tarefa
  // Recebe a tarefa e o novo status como parâmetros
  // Verifica se o ID da tarefa é válido antes de atualizar
  // Se o ID for inválido, exibe um erro no console
  // Atualiza a tarefa chamando o serviço e recarrega a lista de tarefas
  updateTask(task: Task, newStatus: 'OPEN' | 'IN_PROGRESS' | 'DONE') {
    if (!task.id || task.id ===0){
      console.error('Id inválido para atualizartask:', task);
      return;
    }
    const updatedTask = { ...task, status: newStatus };
    this.taskService.updateTask(updatedTask).subscribe(() => {
       this.loadTasks();
    });
  }

  // Deleta uma tarefa
  // Recebe a tarefa como parâmetro
  // Verifica se o ID da tarefa é válido antes de deletar
  // Se o ID for inválido, exibe um erro no console
  // Chama o serviço para deletar a tarefa e atualiza a lista de tarefas
  deleteTask(task: Task) {
    if (!task.id || task.id === 0) {
      console.error('Id inválido para deletar task:', task);
      return;
    }
    this.taskService.deleteTask(task.id).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== task.id);
    });
  }

  // Obtém as tarefas filtradas por status
  // Recebe o status como parâmetro e retorna as tarefas correspondentes
  // Filtra a lista de tarefas com base no status fornecido
  // Retorna um array de tarefas que correspondem ao status
  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

}

