import { HttpClient } from '@angular/common/http'; // Importa o módulo HttpClient para realizar requisições HTTP
import { Injectable, inject } from '@angular/core'; // Importa os módulos Injectable e inject
import { Observable, catchError, throwError } from 'rxjs'; // Importa os módulos Observable, catchError e throwError do RxJS
import { ILogin, ILoginReponse, IRegister, IUser } from '../Models/user-model'; // Importa os tipos relacionados aos usuários e autenticação

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient); // Injeta o serviço HttpClient para realizar requisições HTTP

  // Método para fazer login
  login(login: ILogin): Observable<ILoginReponse> {
    return this.http.post<ILoginReponse>('/api/auth/login', login); // Envia uma requisição POST para fazer login
  }

  // Método para registrar um novo usuário
  register(register: IRegister): Observable<ILoginReponse> {
    return this.http.post<ILoginReponse>('/api/auth/register', register); // Envia uma requisição POST para registrar um novo usuário
  }

  // Método para obter os dados do usuário
  getUserData(): Observable<IUser> {
    return this.http.get<IUser>('api/user/getUser'); // Envia uma requisição GET para obter os dados do usuário
  }
}
