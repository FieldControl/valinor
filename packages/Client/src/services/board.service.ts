import { Injectable } from '@angular/core';
import { HttpClient, ɵHttpInterceptingHandler } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Card {
  id: number;
  title: string;
  column_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Column {
  id: number;
  name: string;
  order: number;
  created_at: Date;
  updated_at: Date;
  cards: Card[];
}

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.apiUrl}/column`);
  }

  createColumn(name: string, order: number): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/column`, { name, order });
  }

  deleteColumn(id: number): Observable<Column> {
    return this.http.delete<Column>(`${this.apiUrl}/column/${id}`);
  }

  updateColumn(id: number, name: string, order: number): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/column/${id}`, {name, order});
  }

  createCard(columnId: number, title: string): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/card`, { columnId, title });
  }

  deleteCard(id: number): Observable<Card> {
    return this.http.delete<Card>(`${this.apiUrl}/card/${id}`);
  }

  updateCard(id: number, title: string, columnId: number): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/card/${id}`, {title, columnId});
  }
}
