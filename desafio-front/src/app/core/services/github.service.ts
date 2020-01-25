import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GithubRepOrder, GithubRepQuery, GithubRepSort, GithubSearch } from 'models';
import { github, GithubEndpoints } from 'utils';


@Injectable({
  providedIn: 'root',
})
export class GithubService {

  public constructor(
    private http: HttpClient,
  ) {}

  public getRepositoriesAdvanced(query: GithubRepQuery, sort: GithubRepSort, order: GithubRepOrder) {

  }

  public getRepositoriesSimple(
    query: string,
    page: string,
    perPage: string,
    sort?: GithubRepSort,
    order?: GithubRepOrder,
  ) {
    const params = {
      q: query,
      page,
      per_page: perPage,
      sort,
      order,
    };

    if (!sort)  { delete(params.sort); }
    if (!order) { delete(params.order); }

    return this.http.get(github(GithubEndpoints.searchRepositories), { params } ) as Observable<GithubSearch>;
  }
}
