import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  GitHubResponse,
  // GithubQueryParams,
} from '@core/interfaces/search.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GitHubService {
  private readonly endpoint: string = 'https://api.github.com/search/';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  getInfo(
    searchText: string,
    pageNumber: number,
    perPage: number
  ): Observable<GitHubResponse> {
    const params = this.route.snapshot.queryParams as { type: string };

    console.log(params);
    return this.http.get<GitHubResponse>(this.endpoint + 'repositories', {
      params: new HttpParams()
        .set('q', searchText ?? ' ')
        .set('type', params.type)
        .set('per_page', perPage.toString() ?? 1)
        .set('page', pageNumber.toString() ?? 1),
    });
  }
}
