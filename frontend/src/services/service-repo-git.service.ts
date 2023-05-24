import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SEARCH_REPOSITORIES_QUERY } from '../query/graphql-query';

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
  constructor(private apollo: Apollo) {}

  searchRepositories(
    query: string,
    first: number,
    after?: string
  ): Observable<SearchResponse> {
    return this.apollo
      .watchQuery<SearchResponse>({
        query: SEARCH_REPOSITORIES_QUERY,
        variables: { query, first, after },
      })
      .valueChanges.pipe(map((result) => result.data));
  }
}
