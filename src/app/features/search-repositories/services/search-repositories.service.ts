import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { IGitHubSearch } from '../interfaces/github.interface';

@Injectable({
  providedIn: 'root',
})
export class SearchRepositoriesService {
  private baseURL = 'https://api.github.com/search/repositories?';

  constructor(private httpClient: HttpClient) {}

  public getRepositories(
    searchTerm: string,
    page: number
  ): Observable<IGitHubSearch> {
    const dataURL = `${this.baseURL}q=${searchTerm}&per_page=10&page=${
      page + 1
    }`;

    return this.httpClient
      .get<IGitHubSearch>(dataURL)
      .pipe(map((response) => response));
  }
}
