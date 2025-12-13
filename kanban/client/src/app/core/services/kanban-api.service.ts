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

  // Columns
  createColumn(boardId: string, payload: { title: string }): Observable<Column> {
    return this.http.post<Column>(
      `${this.baseUrl}/boards/${boardId}/columns`,
      payload,
    );
  }

  // Cards
  createCard(
    columnId: string,
    payload: { title: string; description?: string; dueDate?: string },
  ): Observable<Card> {
    return this.http.post<Card>(
      `${this.baseUrl}/columns/${columnId}/cards`,
      payload,
    );
  }
}
