import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Column, Project, Task } from '../models/kanban.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/query?project_id=${projectId}`);
  }

  getAllColumns(projectId: string): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.apiUrl}/columns/query?project_id=${projectId}`);
  }

  getAllTasks(projectId: string, columnId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks?project_id=${projectId}&column_id=${columnId}`);
  }

  postCreateNewProject() {
    this.http.post(`${this.apiUrl}/projects`, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
