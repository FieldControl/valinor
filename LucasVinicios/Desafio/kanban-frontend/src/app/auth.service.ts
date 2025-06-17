import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private tokenKey = 'accessToken';
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) { } 

  isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  signUp(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, credentials);
  }

  signIn(credentials: { email: string; password: string }): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.accessToken);
        this._isAuthenticated.next(true);
        console.log('--- DEBUG: TOKEN RECEBIDO E SALVO ---', response.accessToken);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }
}