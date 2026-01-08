import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Task, TaskProps } from './services/task';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  tasksList: TaskProps[] = []
  editarId: string | null = null;

  constructor(private taskService: Task) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks(){
    const tasks = this.taskService.getTask().subscribe(tasks => this.tasksList = tasks)
    return tasks
  }

   createTask(task: TaskProps) {
    this.taskService.postTask(task).subscribe({
      next: (res) => {
        console.log('Tarefa criada:', res)
        this.loadTasks()
      },
      error: (err) => console.error('Erro ao criar tarefa:', err)
    })
  }

  enviarFormulario(form: NgForm) {
    this.createTask(form.value)
  }

  excluirTarefa(id: string) {
    this.taskService.deleteTask(id).subscribe({
      next: (res) => {
        console.log('Tarefa deletada:', res)
        this.loadTasks()
      },
      error: (err) => console.error('Erro ao deletar tarefa:', err)
    })
  }

  editarTask(task: TaskProps) {
    this.editarId = task.id;
  }

  cancelEdit() {
    this.editarId = null
  }

  taskEdit(form: NgForm) {
     this.taskService.updateTask(this.editarId, form.value).subscribe({
      next: (res) => {
        console.log('Tarefa editada:', res)
        this.loadTasks()
        
      },
      error: (err) => console.error('Erro ao editar tarefa:', err)
    })
  }
}
