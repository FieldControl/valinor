import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ILogin, ILoginReponse, IRegister } from './models/user.model';

@Injectable({
  providedIn: 'root'
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
