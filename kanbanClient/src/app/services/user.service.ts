import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { InsertModel } from '../models/operations/insert.model';
import { UpdateModel } from '../models/operations/update.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/${id}`);
  }
  getUserByUserName(username: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/username/${username}}`);
  }
  createUser(user: UserModel): Observable<InsertModel> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<InsertModel>(this.apiUrl, user, {headers});
  }

  updateUser(id: string, user: UserModel): Observable<UpdateModel> {
    return this.http.patch<UpdateModel>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<UpdateModel> {
    return this.http.delete<UpdateModel>(`${this.apiUrl}/${id}`);
  }
}
