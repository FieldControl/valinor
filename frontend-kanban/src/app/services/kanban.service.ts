import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  getColumns(): Observable<any> {
    return this.http.get(`${this.apiUrl}/columns`);
  }

  createColumn(columnData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/columns`, columnData);
  }

  updateColumn(id: string, columnData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/columns/${id}`, columnData);
  }

  deleteColumn(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/columns/${id}`);
  }

  getCards(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cards`);
  }

  createCard(cardData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cards`, cardData);
  }

  updateCard(id: string, cardData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cards/${id}`, cardData);
  }

  deleteCard(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${id}`);
  }
}


