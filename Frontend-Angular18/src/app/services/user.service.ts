//decorator com propriedade injetavel.
import { Injectable } from '@angular/core';

//Interfaces
import { isLongin, isLonginAuth, isRegister } from '../interfaces/users.interface';

//Importes para consumo das APIs, protocolo httpClient com os metodos http, e Observable como valor de retorno.
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//class injetavel em toda a raiz do projeto.
@Injectable({
  providedIn: 'root'
})


export class UserService {

  // injetando meu protocolo http em meu serviço
  constructor(private httpClient : HttpClient) { }

  //API para fazer login do usuario, com valor isLogin, retornando um observable.
  login(login : isLongin): Observable <isLonginAuth> {
    return this.httpClient.post<isLonginAuth>( '/api/auth/login' , login)
  }

  //API para registrar novo usuario, com valor isRegister, retornando um observable.
  register(register: isRegister):Observable <isLonginAuth>{
    return this.httpClient.post<isLonginAuth>('/api/auth/register',register)
  }
}
