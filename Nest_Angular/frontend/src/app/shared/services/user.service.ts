import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ILogin, ILoginRespose, IRegister } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  http = inject(HttpClient);
  // Método para fazer login no frontend
  login(login: ILogin): Observable<ILoginRespose> {
    return this.http.post<ILoginRespose>('/api/auth/login', login);    
  }
  // Método para fazer logout no frontend
  register(register: IRegister) {
    return this.http.post<ILoginRespose>('/api/auth/register', register);
  }

}
