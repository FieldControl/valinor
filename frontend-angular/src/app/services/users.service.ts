//decorator com propriedade injetavel.
import { Injectable } from '@angular/core';

//Interfaces
import { isLongin, isRegister, isLonginAuth } from '../interfaces/user.interfaces';

//Importes para consumo das APIs, protocolo httpClient com os metodos http, e Observable como valor de retorno.
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccessComponent } from '../components/formAcessComponets/access/access.component';

//class injetavel em toda a raiz do projeto.
@Injectable({
  providedIn: 'root'
})


export class UserService {
  

  // injetando meu protocolo http em meu serviço
  constructor(private httpClient : HttpClient) { }

  

  //API para fazer login do usuario, com valor isLogin, retornando um observable.
  login(login : isLongin): Observable <isLonginAuth> {
    return this.httpClient.post<isLonginAuth>( 'http://localhost:3000/authenticate/login' , login)
  }

  //API para registrar novo usuario, com valor isRegister, retornando um observable.
  register(register: isRegister):Observable <isLonginAuth>{
    const headers = new HttpHeaders({
      'content-type': 'application/json',
    })
    return this.httpClient.post<isLonginAuth>('http://localhost:3000/authenticate/register', register, { headers });
  }
}
