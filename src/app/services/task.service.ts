// services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
export interface Task {
  id: string;
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
  public allTasks: Task[] = [];

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

  deleteTask(id: string): void {
    this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTasks()) // Atualiza o array após deletar no backend
    ).subscribe();
  }

  moveTask(id: string, newStatus: string): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.patch<Task>(url, { status: newStatus }).pipe(
      tap(() => this.loadTasks()) // Atualiza as tasks após alterar o status
    ).subscribe();
  }

  // deleteTask(id: string): void {
  //   this.allTasks = this.allTasks.filter(task => task.id !== id);
  //   this.tasksSubject.next(this.allTasks);
  // }
}
