import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IBoard, ICreateBoard } from '../models/board.model';

export interface ReordereSwimlaneDto {
  boardId: number;
  items: ReordereSwimlaneItemDto[];
}
export interface ReordereSwimlaneItemDto {
  id: number;
  ordem: number;
}


@Injectable({
  providedIn: 'root',
})
export class BoardService {
  http = inject(HttpClient);

  // Método para criar um novo quadro no frontend 
  criarBoard(createBoard: ICreateBoard): Observable<IBoard> {
    return this.http.post<IBoard>('/api/board', createBoard);
  }
  // Método para atualizar a ordem das colunas no frontend 
  atualizarOrdemSwimlane(reorder: ReordereSwimlaneDto): Observable<void> {
    return this.http.put<void>('/api/swimlane/update-order', reorder);
  }
  // Método para atualizar um quadro no frontend
  atualizarBoard(id: number, createBoard: ICreateBoard): Observable<IBoard> {
    return this.http.patch<IBoard>(`/api/board/${id}`, createBoard);
  }
  // Método para deletar um quadro no frontend
  deletarBoard(boardId: number): Observable<void> {
    return this.http.delete<void>(`/api/board/${boardId}`);
  }
  // Método para obter um quadro por
  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`/api/board/${id}`);
  }
  // Método para obter todos os quadros no frontend
  getBoards(): Observable<IBoard[]> {
    return this.http.get<IBoard[]>('/api/board');
  }
}