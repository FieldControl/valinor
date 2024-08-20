import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ILogin, ILoginReponse, IRegister } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);

  login(login: ILogin): Observable<ILoginReponse> {
    return this.http.post<ILoginReponse>('/api/auth/login', login);
  }

  register(register: IRegister): Observable<ILoginReponse> {
    return this.http.post<ILoginReponse>('/api/auth/register', register);
  }
}
