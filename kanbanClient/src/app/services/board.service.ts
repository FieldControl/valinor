import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoardModel } from '../models/board.model';
import { InsertModel } from '../models/operations/insert.model';
import { UpdateModel } from '../models/operations/update.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private apiUrl = 'http://localhost:3000/boards';

  constructor(private http: HttpClient) { }
  generateHeaders(){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') });
    return headers;
  }
  getBoards(userId: number): Observable<BoardModel[]> {
    const headers = this.generateHeaders();
    return this.http.get<BoardModel[]>(this.apiUrl + "/user/" + userId, {headers});
  }

  getBoard(id: string): Observable<BoardModel> {
    const headers = this.generateHeaders();
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<BoardModel>(url, {headers});
  }

  createBoard(board: BoardModel): Observable<InsertModel> {
    const headers = this.generateHeaders();
    return this.http.post<InsertModel>(this.apiUrl, board, { headers });
  }

  updateBoard(board: BoardModel): Observable<UpdateModel> {
    const url = `${this.apiUrl}/${board.id}`;
    const headers = this.generateHeaders();
    return this.http.patch<UpdateModel>(url, board, { headers });
  }

  deleteBoard(id: string): Observable<UpdateModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.generateHeaders();
    return this.http.delete<UpdateModel>(url, {headers});
  }
}
