import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export interface User { id: number; name: string; email: string; tipo: number; }

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  updateRole(id: number, tipo: number): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}/role`, { tipo });
  }
}
