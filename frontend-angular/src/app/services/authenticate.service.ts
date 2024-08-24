import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  private _token = signal<string | undefined> (undefined);

  set token(_token: string | undefined){
    this._token.set(_token);
  }

  get token(): WritableSignal<string | undefined>{
    return this._token;
  }
}
