import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RepositoriesResponse } from 'src/interfaces/RepositoriesResponse';

@Injectable()
export class GithubService {
  BASE_URL: string = 'https://api.github.com/search/repositories?q=';

  constructor(private http: HttpClient) {}

  getRepositories(query: string) {
    return this.http.get<RepositoriesResponse>(
      `${this.BASE_URL}${query}&per_page=100`
    );
  }
}
