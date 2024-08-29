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

  //API para registrar novo usuario, com valor isRegister, retornando um observable.
  getBoard() : Observable <Iboard[]>{
    return this.httpClient.get<Iboard[]>('http://localhost:3000/board');
  }
}
