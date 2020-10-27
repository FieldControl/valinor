import { Search } from './repos.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReposService {

  baseUrl = "https://api.github.com/search/repositories?q=";
  url: string;

  constructor(private http: HttpClient) { }

  getRepos(query: string = "bootstrap"): Observable<Search> {
    this.url = this.baseUrl + query;
    return this.http.get<Search>(this.url + "&page=1&per_page=10");
  }

  nextPage(page: number): Observable<Search> {
    return this.http.get<Search>(this.url + "&page=" + page + "&per_page=10");
  }

  previousPage(page: number): Observable<Search> {
    return this.http.get<Search>(this.url + "&page=" + page + "&per_page=10");
  }
}