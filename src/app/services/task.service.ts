// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { BehaviorSubject } from 'rxjs';

// // Tipos aceitos nas propriedades status e priority
// export type TaskStatus = "ToDo" | "Doing" | "Finished"
// export type TaskPriority = "Low" | "Medium" | "High"

// // Tipo aceito para o registro da tarefa
// export interface Task {
//   id: number,
//   name: string,
//   description: string,
//   status: TaskStatus,
//   priority: TaskPriority
// }

// @Injectable({
//   providedIn: 'root'
// })

// export class TaskService {
//   private tasksSubject = new BehaviorSubject<Task[]>([]);
//   tasks$ = this.tasksSubject.asObservable();
//   private apiUrl = 'http://localhost:3000/tasks';

//   constructor(private http: HttpClient) { }

//   // Busca tarefas 
//   getTask(): Observable<Task[]> {
//     return this.http.get<Task[]>(this.apiUrl);
//   }

//   // Cria nova tarefa
//   createTask(task: Task): Observable<Task> {
//     return this.http.post<Task>(this.apiUrl, task);
//   }

//   // Deleta tarefa 
//   deleteTask(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`);
//   }
// }


// services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Task {
  id?: number;
  name: string;
  description: string;
  status: 'ToDo' | 'Doing' | 'Finished';
  priority: 'Low' | 'Medium' | 'High';
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  private apiUrl = 'http://localhost:3000/tasks'; // ou o seu endpoint

  constructor(private http: HttpClient) {
    this.loadTasks(); // Carrega no início
  }

  private loadTasks(): void {
    this.http.get<Task[]>(this.apiUrl).subscribe(tasks => {
      this.tasksSubject.next(tasks);
    });
  }

  getTask(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Task): void {
    this.http.post<Task>(this.apiUrl, task).pipe(
      tap(() => this.loadTasks()) // Atualiza as tarefas após adicionar
    ).subscribe();
  }
}
