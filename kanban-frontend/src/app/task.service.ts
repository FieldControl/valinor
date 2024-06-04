import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { task } from './task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<task[]> {
    return this.http.get<task[]>(this.apiUrl);
  }

  getTask(id: number): Observable<task> {
    return this.http.get<task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: task): Observable<task> {
    return this.http.post<task>(this.apiUrl, task);
  }

  updateTask(id: number, task: task): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
