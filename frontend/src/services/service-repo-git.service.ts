import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface Repository {
  name: string;
  url: string;
  description: string;
  watchers: {
    totalCount: number;
  };
  stargazers: {
    totalCount: number;
  };
  issues: {
    totalCount: number;
  };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

interface SearchResponse {
  repositoryCount: number;
  pageInfo: PageInfo;
  edges: {
    node: Repository;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class GitRepoService {
  constructor(private apollo: Apollo, private http: HttpClient) {}

  searchRepositories(
    repo: string,
    page: number,
    perPage: number
  ): Observable<Object> {
    const params = {
      q: repo,
      page: page,
      per_page: perPage,
    };
    return this.http.get('https://api.github.com/search/repositories', {
      params,
    });
  }
}
