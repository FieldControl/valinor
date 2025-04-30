// services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Interface Task - tipa os dados inseridos no arquivo db.json 
export interface Task {
  id: string
  name: string
  description: string
  status: 'ToDo' | 'Doing' | 'Finished'
}

//Injectable 
@Injectable({
  providedIn: 'root'
})

export class TaskService {

  // Cria behaviorSubject para atualizar a lista de tarefas no método loadTasks após uma nova tarefa ser criada 
  private tasksSubject = new BehaviorSubject<Task[]>([]); 
  // Permitindo que outros componentes acessem o Observable e recebam atualizações da lista de tarefas 
  tasks$ = this.tasksSubject.asObservable();
  // Array que armazena as tarefas 
  public allTasks: Task[] = [];

  private apiUrl = 'http://localhost:3000/tasks'; // via json-server 

  // Garante que a função loadTask seja carregada no inicio 
  constructor(private http: HttpClient) {
    this.loadTasks(); 
  }

  // Método para atualizar tarefas na lista 
  private loadTasks(): void {
    this.http.get<Task[]>(this.apiUrl).subscribe(tasks => {
      this.tasksSubject.next(tasks);
    });
  }

  getTask(): Observable<Task[]> {
    return this.tasks$;
  }

  // Insert de uma nova tarefa criada no componente form 
  addTask(task: Task): void {
    this.http.post<Task>(this.apiUrl, task).pipe(
      tap(() => this.loadTasks()) // Atualiza as tarefas após adicionar
    ).subscribe();
  }

  // Delete de uma tarefa 
  deleteTask(id: string): void {
    this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTasks()) // Atualiza o array após deletar tarefa 
    ).subscribe();
  }

  // Move tarefa para outro quadro alterando a propriedade status no arquivo db.json
  moveTask(id: string, newStatus: string): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.patch<Task>(url, { status: newStatus }).pipe(
      tap(() => this.loadTasks()) // Atualiza as tarefas após alterar o status e mover para outro quadro
    ).subscribe();
  }
}
