import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from './board.entity';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private baseUrl = 'http://localhost:3000/boards';

  constructor(private http: HttpClient) {}

  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.baseUrl);
  }

  createBoard(board: Board): Observable<Board> {
    return this.http.post<Board>(this.baseUrl, board);
  }

  updateBoard(board: Board): Observable<Board> {
    const url = `${this.baseUrl}/${board.id}`;
    return this.http.put<Board>(url, board);
  }

  deleteBoard(boardId: number): Observable<any> {
    const url = `${this.baseUrl}/${boardId}`;
    return this.http.delete<any>(url);
  }
}