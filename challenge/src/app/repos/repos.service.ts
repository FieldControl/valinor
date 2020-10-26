import { Search } from './repos.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReposService {

  baseUrl = "https://api.github.com/search/repositories?q=bootstrap";

  constructor(private http: HttpClient) { }

  getRepos(): Observable<Search> {
    return this.http.get<Search>(this.baseUrl);
  }
}
