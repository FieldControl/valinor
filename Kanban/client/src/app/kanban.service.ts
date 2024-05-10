import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Column } from './column/column.interface';
import { Card } from './card/card.interface';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private baseUrl = 'http://localhost:3000'; // Ajuste o URL de acordo com o seu servidor

  constructor(private http: HttpClient) {}

  createColumn(name: string): Observable<Column> {
    return this.http.post<Column>(`${this.baseUrl}/columns`, { name });
  }

  getAllColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.baseUrl}/columns`);
  }

  getColumnById(columnId: number): Observable<Column> {
    return this.http.get<Column>(`${this.baseUrl}/columns/${columnId}`);
  }

  updateColumn(columnId: number, name: string): Observable<Column> {
    return this.http.put<Column>(`${this.baseUrl}/columns/${columnId}`, { name });
  }

  deleteColumn(columnId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/columns/${columnId}`);
  }

  createCard(columnId: number, title: string, description: string): Observable<Card> {
    return this.http.post<Card>(`${this.baseUrl}/columns/${columnId}/cards`, { title, description });
  }

  getCardsInColumn(columnId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/columns/${columnId}/cards`);
  }

  updateCard(cardId: number, title: string, description: string): Observable<Card> {
    return this.http.put<Card>(`${this.baseUrl}/columns/${cardId}`, { title, description });
  }

  deleteCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/columns/${cardId}`);
  }

  moveCard(sourceColumnId: number, targetColumnId: number, cardId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/columns/move-card`, { sourceColumnId, targetColumnId, cardId });
  }
}