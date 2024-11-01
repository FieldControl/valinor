import { Injectable, signal, WritableSignal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _token = signal<string | undefined>(undefined);

  /**
   * Construtor do serviço de autenticação.
   * 
   * Este construtor verifica se há um token armazenado no `localStorage`.
   * Se um token for encontrado, ele é definido no serviço de token.
   */
  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this._token.set(token);
    }
  }
  set token(_token: string | undefined) {
    this._token.set(_token);
    localStorage.setItem('token', _token || '');
  }

  get token(): WritableSignal<string | undefined> {
    return this._token;
  }

  // Método para verificar se o token é válido
  // O método verifica se o token existe e se ele ainda é válido
  // O método jwtDecode é usado para decodificar o token e obter a data de expiração
  // O método retorna true se o token for válido e false caso contrário
  // O método é usado para verificar se o usuário está autenticado
  // antes de acessar rotas protegidas no frontend 
  temTokenValido(): boolean {
    const token = this._token();
    if (!token) return false;
    const decodedToken = jwtDecode(token);
    const now = Date.now() / 1000;
    if (!decodedToken.exp) return false;
    return decodedToken.exp > now;
  }
}
