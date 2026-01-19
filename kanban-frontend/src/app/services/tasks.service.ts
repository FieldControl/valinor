import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskPriority } from './task-priority.enum';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
}

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
     return this.http.get<Task[]>(this.apiUrl);
  }

  createTask(title: string, description: string, status: Task['status'], priority: TaskPriority): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, {
      title,
      description, 
      status,
      priority,
    });
  }
  //Atualiza o status da tarefa
  updateTaskStatus(id: number, status: Task['status']) {
  return this.http.patch<Task>(
    `${this.apiUrl}/${id}/status`,
    { status }
  );
  }
  //Atualiza alguma modificação da tarefa
  updateTask(id: number, data: Partial<Task>) {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, data);
  }
  deleteTask(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
