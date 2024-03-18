import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated(): boolean {
    const token = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('token='));
    return !!token;
  }
}
