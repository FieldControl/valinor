// src/app/kanban-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from './models/board.model';
import { Column } from './models/column.model';
import { Card } from './models/card.model';
import { User } from './models/user.model'; // Importe o modelo User


@Injectable({
  providedIn: 'root'
})
export class KanbanApiService {
  private apiUrl = 'http://localhost:3000'; // URL base do seu backend NestJS

  constructor(private http: HttpClient) { }

  // --- Métodos para Boards ---
  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/board`);
  }

  createBoard(title: string): Observable<Board> {
    return this.http.post<Board>(`${this.apiUrl}/board`, { title });
  }

  // Atualizar um board existente
  updateBoard(id: number, data: Partial<Board>): Observable<Board> {
    return this.http.patch<Board>(`${this.apiUrl}/board/${id}`, data);
  }

  // Remover um board existente
  removeBoard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/board/${id}`);
  }

  // --- Métodos para Columns ---
  getColumnsByBoard(boardId: number): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.apiUrl}/column/board/${boardId}`);
  }

  createColumn(boardId: number, title: string, order: number): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/column`, { boardId, title, order });
  }

  // Atualizar uma coluna existente
  updateColumn(id: number, data: Partial<Column>): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/column/${id}`, data);
  }

  // Remover uma coluna existente
  removeColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/column/${id}`);
  }

  // --- Métodos para Cards ---
  getCardsByColumn(columnId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/card/column/${columnId}`);
  }

  createCard(columnId: number, title: string, description: string, order: number): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/card`, { columnId, title, description, order });
  }

  // Atualizar um card existente (usado no Drag and Drop e edição)
  updateCard(id: number, data: Partial<Card>): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/card/${id}`, data);
  }

  // Remover um card existente
  removeCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/card/${id}`);
  }

  // --- Métodos para Membros do Board ---
  getBoardMembers(boardId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/board/${boardId}/members`);
  }

  addBoardMember(boardId: number, email: string): Observable<Board> {
    return this.http.post<Board>(`${this.apiUrl}/board/${boardId}/members`, { email });
  }

  removeBoardMember(boardId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/board/${boardId}/members/${userId}`);
  }
}