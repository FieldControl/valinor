import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Iboard } from '../../interfaces/board.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  // injetando meu protocolo http em meu serviço
  constructor(private httpClient : HttpClient) { }

  

  //API para fazer login do usuario, com valor isLogin, retornando um observable.
  // creatBoard(newBoard : Iboard): Observable <isLonginAuth> {
  //   return this.httpClient.post<isLonginAuth>( 'http://localhost:3000/authenticate/login' , login)
  // }

   // Método para obter todos os boards, retornando um Observable de um array de Iboard
  getBoards(): Observable<Iboard[]>{
    console.log('minha API está sendo enviada')
    console.log(Headers)
    return this.httpClient.get<Iboard[]>('http://localhost:3000/board');
  }
}
