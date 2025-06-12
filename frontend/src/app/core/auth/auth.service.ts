import { Injectable } from '@angular/core';
import { Router }     from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // credenciais fixas
  private readonly USER = { email: 'admin@test.com', password: 'adminpass' };

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    if (email === this.USER.email && password === this.USER.password) {
      localStorage.setItem('loggedIn', 'true');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('loggedIn');
    this.router.navigate(['/login']);
  }

  isLogged(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }
}
