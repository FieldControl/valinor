import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  tipo: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _loggedIn = false;
  private users: User[] = [
    { id: 1, name: 'Admin', email: 'admin@test.com', tipo: 0 },
    { id: 2, name: 'User',  email: 'user@test.com',  tipo: 2 },
  ];

  login(email: string, password: string): boolean {
    if (email === 'admin@test.com' && password === 'adminpass') {
      this._loggedIn = true;
      return true;
    }
    return false;
  }

  isLogged(): boolean {
    return this._loggedIn;
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  updateRole(id: number, newTipo: number): Observable<User> {
    const u = this.users.find(x => x.id === id)!;
    u.tipo = newTipo;
    return of(u);
  }

  logout(): void {
    this._loggedIn = false;
  }
}
