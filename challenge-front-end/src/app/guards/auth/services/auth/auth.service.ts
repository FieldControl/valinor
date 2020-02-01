import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  token: string;

  constructor(
    private router: Router
    ) {}

  isAuthenticated() {
    // @TODO: Implementar
    return true;
    // return this.token != null;
  }
}
