import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  endpoint = 'https://api.github.com/users';
  constructor(private http: HttpClient) {}
  getAllRepo(user:string): Observable<any> {
    return this.http.get(`${this.endpoint}/${user}/repos`)
  }
  
}
