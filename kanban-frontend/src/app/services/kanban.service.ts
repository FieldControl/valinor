// src/app/services/kanban.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from '../models/board.model';
import { Column } from '../models/column.model';
import { Task } from '../models/task.model';


@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/'; // URL base da sua API NestJS

  constructor(private http: HttpClient) { }

  // Métodos para o Board
  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/boards`);
  }

  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/boards/${id}`);
  }

  createBoard(board: Partial<Board>): Observable<Board> {
    return this.http.post<Board>(`${this.apiUrl}/boards`, board);
  }

  updateBoard(id: string, board: Partial<Board>): Observable<Board> {
    return this.http.patch<Board>(`${this.apiUrl}/boards/${id}`, board);
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/boards/${id}`);
  }

  // Métodos para Colunas
  createColumn(boardId: string, column: Partial<Column>): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/boards/${boardId}/columns`, column);
  }

  updateColumn(boardId: string, columnId: string, column: Partial<Column>): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/boards/${boardId}/columns/${columnId}`, column);
  }

  deleteColumn(boardId: string, columnId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/boards/${boardId}/columns/${columnId}`);
  }

  // Métodos para Tarefas
  createTask(boardId: string, columnId: string, task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/boards/${boardId}/columns/${columnId}/tasks`, task);
  }

  updateTask(boardId: string, columnId: string, taskId: string, task: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, task);
  }

  deleteTask(boardId: string, columnId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`);
  }

  // Método para mover tarefas entre colunas
  moveTask(
    boardId: string, 
    sourceColumnId: string, 
    destinationColumnId: string, 
    taskId: string,
    newIndex: number
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/boards/${boardId}/move-task`, {
      sourceColumnId,
      destinationColumnId,
      taskId,
      newIndex
    });
  }
}