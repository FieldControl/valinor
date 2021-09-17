import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from './models/page';
import { Repository } from './models/repository';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly url = 'https://api.github.com/search/';

  constructor(private http: HttpClient) {}

  searchRepositories(query: string, sort: string, order: string, page: number) {
    const requestUrl =
      this.url +
      `repositories?q=${query}&sort=${sort}&order=${order}&page=${page}`;
    return this.http.get<Page<Repository>>(requestUrl);
  }
}
