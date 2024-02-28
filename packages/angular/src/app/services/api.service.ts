import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Project } from '../models/kanban.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiUrl: string;
  allProjectsData?: Array<Project>;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  getAllProjectsDataApi(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}projects`);
  }

  getProjectsDataApiById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}projects/get?id=${id}`);
  }

  postCreateNewProject() {
    this.http.post(`${this.apiUrl}/projects`, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
