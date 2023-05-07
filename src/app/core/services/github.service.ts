import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { GitHubReposApiResponse } from '@core/models/github/repos-api-response.model';
import { GitHubApiResponseMapper } from '@core/mappers/github/repos-api-response-mapper';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private apiUrl: string = environment.gitHubApiUrl;

  constructor(private http: HttpClient) {}

  searchRepos(params: HttpParams): Observable<GitHubReposApiResponse> {
    return this.http
      .get(this.apiUrl, { params })
      .pipe<GitHubReposApiResponse>(
        map((response) => GitHubApiResponseMapper(response))
      );
  }
}
