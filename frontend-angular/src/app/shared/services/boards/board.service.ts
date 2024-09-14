import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Iboard, IcreateBoard } from '../../interfaces/board.interface';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  refetch$: any;

  // injetando meu protocolo http em meu serviço
  constructor(private httpClient : HttpClient) { }

  

  //API para fazer login do usuario, com valor isLogin, retornando um observable.
  creatBoard(newBoard : IcreateBoard): Observable <Iboard> {
    return this.httpClient.post<Iboard>( 'http://localhost:3000/board', newBoard)
  }

   // Método para obter todos os boards, retornando um Observable de um array de Iboard
  getBoards(): Observable<Iboard[]>{
    return this.httpClient.get<Iboard[]>('http://localhost:3000/board');
  }

  getBoardById(boardId : number): Observable<Iboard> {
    return this.httpClient.get<Iboard>(`http://localhost:3000/board/${boardId}`);
  }

  updateBoard(id: number, newBoard : IcreateBoard): Observable <void> {
    return this.httpClient.patch<void>( `http://localhost:3000/board/${id}`, newBoard)
  }

  deleteBoarde(boardId : number):Observable <Iboard>{
    return this.httpClient.delete<Iboard>( `http://localhost:3000/board/${boardId}`)
  }
  
}