import { Injectable, signal, WritableSignal } from '@angular/core';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  private _token = signal<string | undefined> (undefined);

  constructor(){
    const token = localStorage.getItem('token');
    if (token) {
      this._token.set(token);
    }
  }

  set token(_token: string | undefined){
    this._token.set(_token);
    localStorage.setItem('token', _token || '' );
  }

  get token(): WritableSignal<string | undefined>{
    return this._token;
  }

  hasvalidTokten(): boolean {
    const token = this._token() ;
    if (!token) {
      return false
    };
    
    const decodeToken = jwtDecode(token);
    const now = Date.now() / 1000;
    if (!decodeToken.exp) {
      return false
    };
    return decodeToken.exp > now
    
  }
}
