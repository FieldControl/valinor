import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from '../models/board.model';
import { Column } from '../models/column.model';
import { Card } from '../models/card.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class KanbanApiService {
  private readonly baseUrl = environment.apiUrl ?? 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Boards
  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.baseUrl}/boards`);
  }

  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.baseUrl}/boards/${id}`);
  }

  createBoard(payload: { name: string }): Observable<Board> {
    return this.http.post<Board>(`${this.baseUrl}/boards`, payload);
  }

  updateBoard(id: string, payload: { name?: string }) {
    return this.http.put<Board>(`${this.baseUrl}/boards/${id}`, payload);
  }

  deleteBoard(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/boards/${id}`);
  }


  // Columns
  createColumn(boardId: string, payload: { title: string; order?: number}): Observable<Column> {
    return this.http.post<Column>(
      `${this.baseUrl}/boards/${boardId}/columns`,
      payload,
    );
  }

  updateColumn(id: string, payload: { title?: string; order?: number }) {
    return this.http.patch<Column>(`${this.baseUrl}/columns/${id}`, payload);
  }

  deleteColumn(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/columns/${id}`);
  }

  // Cards
  createCard(
    columnId: string,
    payload: { title: string; description?: string; dueDate?: string, order?: number, columnId?: string},
  ): Observable<Card> {
    return this.http.post<Card>(
      `${this.baseUrl}/columns/${columnId}/cards`,
      payload,
    );
  }

  updateCard(
    id: string,
    payload: { title?: string; description?: string; dueDate?: string, order?: number, columnId?: string},
  ) {
    return this.http.patch<Card>(`${this.baseUrl}/cards/${id}`, payload);
  }

  deleteCard(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/cards/${id}`);
  }
}
