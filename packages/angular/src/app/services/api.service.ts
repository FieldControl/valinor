import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Column, HandleMessage, Project, Task } from '../models/kanban.model';

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

  getAllColumns(projectId: string): Observable<Column[] | HandleMessage> {
    return this.http.get<Column[]>(`${this.apiUrl}/columns/query?project_id=${projectId}`);
  }

  getAllTasks(projectId: string, columnId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks?project_id=${projectId}&column_id=${columnId}`);
  }

  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/query?project_id=${projectId}`);
  }

  getColumnById(projectId: string): Observable<Column> {
    return this.http.get<Column>(`${this.apiUrl}/columns/query?project_id=${projectId}`);
  }

  getTaskById(projectId: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/query?project_id=${projectId}`);
  }

  createProject(projectTitle: string): Observable<Project> {
    const body = {
      title: projectTitle,
    };
    return this.http.post<Project>(`${this.apiUrl}/projects`, body);
  }

  createColumn(projectId: string, columnTitle: string): Observable<Column> {
    const body = {
      _id_project: projectId,
      title: columnTitle,
    };
    return this.http.post<Column>(`${this.apiUrl}/columns`, body);
  }

  createTask(projectId: string, columnId: string, taskTitle: string, descriptionTask: string): Observable<Task> {
    const body = {
      _id_project: projectId,
      _id_column: columnId,
      title: taskTitle,
      description: descriptionTask,
    };
    return this.http.post<Task>(`${this.apiUrl}/tasks`, body);
  }

  updateProjectTitle(projectId: string, projectTitle: string): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/projects/query?project_id=${projectId}`, { title: projectTitle });
  }

  updateColumnTitle(columnId: string, columnTitle: string): Observable<Column> {
    return this.http.put<Column>(`${this.apiUrl}/columns/query?column_id=${columnId}`, { title: columnTitle });
  }

  updateTaskTitle(taskId: string, title: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/query?task_id=${taskId}`, {
      title: title,
    });
  }

  updateTaskDescription(taskId: string, description: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/query?task_id=${taskId}`, {
      description: description,
    });
  }

  deleteProject(projectId: string): Observable<Project> {
    return this.http.delete<Project>(`${this.apiUrl}/projects/query?project_id=${projectId}`);
  }

  deleteColumn(columnId: string): Observable<Column> {
    return this.http.delete<Column>(`${this.apiUrl}/columns/query?column_id=${columnId}`);
  }

  deleteTask(taskId: string): Observable<Task> {
    return this.http.delete<Task>(`${this.apiUrl}/tasks/query?task_id=${taskId}`);
  }

  archiveTask(taskId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks/archive?task_id=${taskId}`, '');
  }

  recoveryTask(taskId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks/recovery?task_id=${taskId}`, '');
  }
}
