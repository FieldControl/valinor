import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsertModel } from '../models/operations/insert.model';
import { UpdateModel } from '../models/operations/update.model';
import { AuthModel } from '../models/auth.model';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth/login';

  constructor(private http: HttpClient) { }

  login(loginModel: UserModel): Observable<AuthModel> {
    return this.http.post<AuthModel>(this.apiUrl, loginModel);
  }
}
