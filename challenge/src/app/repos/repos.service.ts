import { Search } from './repos.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { debug } from 'console';

@Injectable({
  providedIn: 'root'
})
export class ReposService {

  baseUrl = "https://api.github.com/search/repositories?q=";
  url: string;
  query: string;

  constructor(private http: HttpClient) { }

  getRepos(): Observable<Search> {
    this.url = this.baseUrl + this.query;
    return this.http.get<Search>(this.url + "&page=1&per_page=10");
  }

  nextPage(page: number): Observable<Search> {
    return this.http.get<Search>(this.url + "&page=" + page + "&per_page=10");
  }

  previousPage(page: number): Observable<Search> {
    return this.http.get<Search>(this.url + "&page=" + page + "&per_page=10");
  }
}