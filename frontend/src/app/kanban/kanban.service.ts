import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/kanban';

  constructor(private http: HttpClient) {}

  getBoards(): Observable<any> {
    return this.http.get(`${this.apiUrl}/boards`);
  }

  createBoard(title: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/boards`, { title });
  }

  updateBoard(boardId: string, title: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/boards/${boardId}`, { title });
  }

  deleteBoard(boardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/boards/${boardId}`);
  }

  getBoardById(boardId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/boards/${boardId}`);
  }

  getColumnsByBoardId(boardId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/boards/${boardId}/columns`);
  }

  createColumn(boardId: string, title: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/boards/${boardId}/columns`, {
      title,
    });
  }

  updateColumn(columnId: string, title: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/columns/${columnId}`, { title });
  }

  deleteColumn(columnId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/columns/${columnId}`);
  }

  createCard(columnId: string, description: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/columns/${columnId}/cards`, {
      description,
    });
  }

  getCardById(cardId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cards/${cardId}`);
  }

  updateCard(cardId: string, isCompleted: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/cards/${cardId}`, { isCompleted });
  }

  deleteCard(cardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${cardId}`);
  }

  updateCardDescription(cardId: string, description: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cards/${cardId}/description`, { description });
  }
}