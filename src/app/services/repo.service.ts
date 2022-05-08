import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repositories } from '../interface/repositories';

@Injectable({
  providedIn: 'root'
})
export class RepoService {

  requestURL = "https://api.github.com/search/repositories?q="

  constructor(private http: HttpClient) { }

  read(search: string, page:number = 1): Observable<Repositories> {
    return this.http.get<Repositories>(`${this.requestURL}${search}&page=${page}`)
  }
}
