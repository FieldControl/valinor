import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IBoard, ICreateBoard } from '../models/board.model';

export interface ReordereColumnDto {
  boardId: number;
  items: ReordereColumnItemDto[];
}
export interface ReordereColumnItemDto {
  id: number;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  http = inject(HttpClient);

  createBoard(createBoard: ICreateBoard): Observable<IBoard> {
    return this.http.post<IBoard>('/api/board', createBoard);
  }
  updateColumnOrder(reorder: ReordereColumnDto): Observable<void> {
    return this.http.put<void>('/api/column/update-order', reorder);
  }
  updateBoard(id: number, createBoard: ICreateBoard): Observable<IBoard> {
    return this.http.patch<IBoard>(`/api/board/${id}`, createBoard);
  }
  deleteBoard(boardId: number): Observable<void> {
    return this.http.delete<void>(`/api/board/${boardId}`);
  }
  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`/api/board/${id}`);
  }
  getBoards(): Observable<IBoard[]> {
    return this.http.get<IBoard[]>('/api/board');
  }
}
