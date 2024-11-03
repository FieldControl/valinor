import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsertModel } from '../models/operations/insert.model';
import { UpdateModel } from '../models/operations/update.model';
import { TaskModel } from '../models/task.model';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/Tasks';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<TaskModel[]> {
    const headers = this.generateHeaders();
    return this.http.get<TaskModel[]>(this.apiUrl, {headers});
  }

  getTask(id: string): Observable<TaskModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.generateHeaders();
    return this.http.get<TaskModel>(url, {headers});
  }

  createTask(Task: TaskModel): Observable<InsertModel> {
    const headers = this.generateHeaders();
    return this.http.post<InsertModel>(this.apiUrl, Task, { headers });
  }

  updateTask(Task: TaskModel): Observable<UpdateModel> {
    const url = `${this.apiUrl}/${Task.id}`;
    const headers = this.generateHeaders();
    return this.http.patch<UpdateModel>(url, Task, { headers });
  }

  deleteTask(id: string): Observable<UpdateModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.generateHeaders();
    return this.http.delete<UpdateModel>(url, {headers});
  }
  generateHeaders(){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') });
    return headers;
  }
}
