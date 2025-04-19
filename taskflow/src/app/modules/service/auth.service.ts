import { Injectable } from '@angular/core';
import { LoginResponse } from '../interface/login-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: LoginResponse | null = null;

  setUser(user: LoginResponse): void {
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): LoginResponse | null {
    if (this.user) {
      return this.user;
    }

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        return this.user;
      }
    }

    return null;
  }

  clearUser(): void {
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }
}
