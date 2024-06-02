import { Injectable, WritableSignal, signal } from '@angular/core'; // Importa os módulos necessários
import { jwtDecode } from 'jwt-decode'; // Importa a função jwtDecode para decodificar tokens JWT

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _token = signal<string | undefined>(undefined); // Declara um sinal para armazenar o token de autenticação

  constructor() {
    // Ao instanciar o serviço, verifica se há um token no localStorage e o define no sinal
    const token = localStorage.getItem('token');
    if (token) {
      this._token.set(token);
    }
  }

  // Define o token de autenticação e armazena no localStorage
  set token(_token: string | undefined) {
    this._token.set(_token); // Define o novo valor do token no sinal
    localStorage.setItem('token', _token || ''); // Armazena o token no localStorage
  }

  // Retorna o sinal que contém o token de autenticação
  get token(): WritableSignal<string | undefined> {
    return this._token;
  }

  // Verifica se o token atual é válido
  hasValidToken(): boolean {
    const token = this._token(); // Obtém o valor atual do token do sinal
    if (!token) return false; // Retorna falso se não houver token
    const decodedToken = jwtDecode(token); // Decodifica o token JWT
    const now = Date.now() / 1000; // Obtém o timestamp atual em segundos
    if (!decodedToken.exp) return false; // Retorna falso se o token não contiver o campo 'exp' (data de expiração)
    return decodedToken.exp > now; // Retorna true se a data de expiração do token for posterior ao timestamp atual
  }
}
