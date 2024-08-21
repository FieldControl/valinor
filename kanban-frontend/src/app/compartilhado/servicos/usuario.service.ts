import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ILogin, ILoginResponse, IRegistro } from '../modelos/usuario.modelo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  http = inject(HttpClient);

  login(login: ILogin): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>('/api/autenticar/login', login);
  }

  registro(registro: IRegistro): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>('/api/autenticar/registro', registro);
  }
}
