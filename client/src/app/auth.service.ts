import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  token: string = '';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      map((response: any) => response.token),
      tap((token: string) => {
        this.token = token;
        localStorage.setItem('token', token);
      })
    );
  }
  
  register(name: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

}
