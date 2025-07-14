// ARQUIVO: src/app/services/auth.ts (ATUALIZADO)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
// ✅ 1. Importa o nosso ficheiro de configuração de ambiente.
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ✅ 2. A URL base agora vem dinamicamente do ficheiro de ambiente,
  //    e nós adicionamos a sub-rota '/auth'.
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  private readonly authTokenKey = 'kanban_auth_token';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.access_token);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.authTokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }
}