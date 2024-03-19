import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _url: string = 'http://localhost:8080';

  constructor(private http: HttpClient, private cookieService: CookieService, private route: ActivatedRoute) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this._url}/sessions`, data);
  }

  register(data: { email: string; password: string; name: string }): Observable<any> {
    return this.http.post(`${this._url}/accounts`, data);
  }

  project(data: { title: string; isTemplate: string }): Observable<any> {
    const token = this.cookieService.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.post(`${this._url}/projects`, data, { headers });
  }

  getProjects(): Observable<any> {
    const token = this.cookieService.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.get(`${this._url}/projects`, { headers });
  }

  getProjectById(projectId: string | null): Observable<any> {
    const token = this.cookieService.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.get(`${this._url}/projects/${projectId}`, { headers });
  }

  column(data: { title: string }, projectId: any): Observable<any> {
    const token = this.cookieService.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    const columnData = {
      ...data,
      projectId,
    };

    return this.http.post(`${this._url}/column`, columnData, { headers });
  }

  getCardByColumnId(columnId: string | null): Observable<any> {
    console.log(columnId);

    const token = this.cookieService.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.get(`${this._url}/tasks?columnId=${columnId}`, { headers });
  }

  createCard(
    data: {
      title: string;
      description: string;
      archived: boolean;
    },
    projectId: string | null,
    columnId: string
  ): Observable<any> {
    const token = this.cookieService.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    const cardData = {
      ...data,
      columnId,
      projectId,
    };

    return this.http.post(`${this._url}/tasks`, cardData, { headers });
  }
}
