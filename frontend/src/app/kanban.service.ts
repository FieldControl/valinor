import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000';  

  constructor(private http: HttpClient) {}

  getColumns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/columns`);
  }

  getCardsByColumn(columnId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cards/${columnId}`);
  }

  createCard(title: string, description: string, columnId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cards`, { title, description, columnId });
  }
}
