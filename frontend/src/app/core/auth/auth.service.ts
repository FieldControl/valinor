import { Injectable }            from '@angular/core';
import { HttpClient }            from '@angular/common/http';
import { tap }                   from 'rxjs/operators';
import { Observable }            from 'rxjs';
import { environment }           from '../../../enviroments/enviroment';

interface LoginResponse { access_token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.token = res.access_token));
  }

  isLogged(): boolean {
    return !!this.token;
  }

  logout() {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }
}
