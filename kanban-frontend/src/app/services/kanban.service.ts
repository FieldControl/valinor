import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000'; // Backend API

  constructor(private http: HttpClient) {}

  getColumns(): Observable<any> {
    return this.http.get(`${this.apiUrl}/columns`);
  }

  addColumn(title: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/columns`, { title });
  }
}