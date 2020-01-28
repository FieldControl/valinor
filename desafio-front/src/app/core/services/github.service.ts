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

  public getRepositoriesAdvanced(
    query: GithubRepQuery,
    page: string,
    perPage: string,
    sort?: GithubRepSort,
    order?: GithubRepOrder,
  ) {
    const params = {
      q: '',
      page,
      per_page: perPage,
      sort,
      order,
    };

    const queries: string[] = [];

    if (query.text) {
      queries.push(query.text);

      if (query.in) {
        const inOptions = Object.keys(query.in).filter(key => query.in[key]);

        if (inOptions.length > 0) { queries.push(`in:${inOptions.join(',')}`); }
      }
    }

    if (query.user) { queries.push(`user:${query.user}`); }
    if (query.org) { queries.push(`org:${query.org}`); }

    if (query.language) { queries.push(`language:"${query.language}"`); }
    if (query.topic) { queries.push(`topic:"${query.topic}"`); }

    if (query.created) {
      const date = query.created as Date;

      queries.push('created:' +
        query.createdComp +
        date.getFullYear() + '-' +
        (date.getMonth() + 1).toString(10).padStart(2, '0') + '-' +
        date.getDate().toString(10).padStart(2, '0'),
      );
    }

    if (query.pushed) {
      const date = query.pushed as Date;

      queries.push('pushed:' +
        query.pushedComp +
        date.getFullYear() + '-' +
        (date.getMonth() + 1).toString(10).padStart(2, '0') + '-' +
        date.getDate().toString(10).padStart(2, '0'),
      );
    }

    if (query.is) { queries.push(`is:${query.is}`); }
    if (query.mirror) { queries.push(`mirror:${query.mirror}`); }
    if (query.archived) { queries.push(`archived:${query.archived}`); }

    for (const searchValue of ['followers', 'forks', 'size', 'stars', 'topics']) {
      if (query[searchValue].n) {
        queries.push(searchValue + ':' +
          (query[searchValue].comp === '..' ? query[searchValue].n : query[searchValue].betweenAnd || '') +
          query[searchValue].comp +
          (query[searchValue].comp === '..' ? query[searchValue].betweenAnd || '' : query[searchValue].n),
        );
      }
    }

    if (query.goodFirstIssues.n) {
      queries.push('good-first-issues:' +
        (query.goodFirstIssues.comp === '..' ? query.goodFirstIssues.n : query.goodFirstIssues.betweenAnd || '') +
        query.goodFirstIssues.comp +
        (query.goodFirstIssues.comp === '..' ? query.goodFirstIssues.betweenAnd || '' : query.goodFirstIssues.n),
      );
    }

    if (query.helpWantedIssues.n) {
      queries.push('help-wanted-issues:' +
        (query.helpWantedIssues.comp === '..' ? query.helpWantedIssues.n : query.helpWantedIssues.betweenAnd || '') +
        query.helpWantedIssues.comp +
        (query.helpWantedIssues.comp === '..' ? query.helpWantedIssues.betweenAnd || '' : query.helpWantedIssues.n),
      );
    }

    if (!sort)  { delete(params.sort); }
    if (!order) { delete(params.order); }

    if (!queries.length) {
      return null;
    }

    params.q = queries.join(' ');

    return this.http.get(github(GithubEndpoints.searchRepositories), { params } ) as Observable<GithubSearch>;
  }
}
