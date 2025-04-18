import { Injectable } from '@angular/core';
import { LoginResponse } from './modules/interface/login-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: any;

  setUser(user: LoginResponse) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

  clearUser() {
    this.user = null;
  }
}