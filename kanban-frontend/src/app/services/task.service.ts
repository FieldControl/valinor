import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../componentes/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:3000/tasks'


  constructor(private http: HttpClient) { }

  getTasks(): Observable<any>{
    return this.http.get(this.apiUrl)
  }

  getTaskById(id:number):Observable<Task>{
    return this.http.get<Task>(`${this.apiUrl}/${id}`)
  }

  addTask(task: Task): Observable<Task>{
    return this.http.post<Task>(this.apiUrl, task)
  }

  updateTask(id: number, task: Task): Observable<Task>{
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task)
  }

  deleteTask(id: number): Observable<Task>{
    return this.http.delete<Task>(`${this.apiUrl}/${id}`)
  }



}
