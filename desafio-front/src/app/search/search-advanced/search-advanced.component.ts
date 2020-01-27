import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { FormControl, FormGroup } from '@ng-stack/forms';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { GithubRep, GithubRepComp, GithubRepQuery, GithubRepSearchValue, GithubSearch, SelectOption } from 'models';
import { GithubService } from 'services';
import { FormUtil } from 'utils';


@Component({
  selector: 'app-search-advanced',
  templateUrl: './search-advanced.component.html',
})
export class SearchAdvancedComponent {

  public loading = false;
  public error = false;
  public emptySearch = false;

  public repositories: GithubRep[] = [];

  public readonly loadingIterator = Array(10);

  public currentPage = 1;
  public totalItems = 0;

  public readonly inLabels = {
    description: 'Descrição',
    name: 'Nome',
    readme: 'README',
  };

  public readonly compOptions: SelectOption[] = [
    { value: '',   name: 'Igual' },
    { value: '..', name: 'Entre' },
    { value: '>',  name: 'Maior que' },
    { value: '<',  name: 'Menor que' },
    { value: '>=', name: 'Maior ou igual' },
    { value: '<=', name: 'Menor ou igual' },
  ];

  public readonly boolFilterOptions: SelectOption[] = [
    { value: '', name: 'Todos' },
    { value: 'true', name: 'Sim' },
    { value: 'false', name: 'Não' },
  ];

  public readonly privacyOptions: SelectOption[] = [
    { value: '', name: 'Todos' },
    { value: 'public', name: 'Público' },
    { value: 'private', name: 'Privado' },
  ];

  public readonly form = new FormGroup<GithubRepQuery>({
    in: new FormGroup ({
      description: new FormControl<boolean>(),
      name: new FormControl<boolean>(),
      readme: new FormControl<boolean>(),
    }),
    repo: new FormGroup ({
      name: new FormControl<string>(),
      owner: new FormControl<string>(),
    }),
    archived: new FormControl<string>(''),
    mirror: new FormControl<string>(''),

    followers: new FormGroup<GithubRepSearchValue>({
      n: new FormControl<number>(),
      betweenAnd: new FormControl<number>(),
      comp: new FormControl<GithubRepComp>(''),
    }),
    forks: new FormGroup<GithubRepSearchValue>({
      n: new FormControl<number>(),
      betweenAnd: new FormControl<number>(),
      comp: new FormControl<GithubRepComp>(''),
    }),
    goodFirstIssues: new FormGroup<GithubRepSearchValue>({
      n: new FormControl<number>(),
      betweenAnd: new FormControl<number>(),
      comp: new FormControl<GithubRepComp>(''),
    }),
    helpWantedIssues: new FormGroup<GithubRepSearchValue>({
      n: new FormControl<number>(),
      betweenAnd: new FormControl<number>(),
      comp: new FormControl<GithubRepComp>(''),
    }),
    size: new FormGroup<GithubRepSearchValue>({
      n: new FormControl<number>(),
      betweenAnd: new FormControl<number>(),
      comp: new FormControl<GithubRepComp>(''),
    }),
    stars: new FormGroup<GithubRepSearchValue>({
      n: new FormControl<number>(),
      betweenAnd: new FormControl<number>(),
      comp: new FormControl<GithubRepComp>(''),
    }),
    topics: new FormGroup<GithubRepSearchValue>({
      n: new FormControl<number>(),
      betweenAnd: new FormControl<number>(),
      comp: new FormControl<GithubRepComp>(''),
    }),

    created: new FormControl<string>(),
    language: new FormControl<string>(),
    license: new FormControl<string>(),
    org: new FormControl<string>(),
    pushed: new FormControl<string>(),
    text: new FormControl<string>(),
    topic: new FormControl<string>(),
    user: new FormControl<string>(),

    is: new FormControl<'public' | 'private' | ''>(''),
  });


  public constructor(
    private readonly router: Router,
    private readonly githubService: GithubService,
  ) {}

  public search() {
    FormUtil.touchForm(this.form);

    if (this.form.valid) {
      this.router.navigate(['busca-avancada'], { queryParams: {
        t: this.form.controls.text.value,
      }});

      this.currentPage = 1;
      this.totalItems = 0;

      this.performSearch(1, (response: GithubSearch) => { this.totalItems = Math.min(response.total_count, 1000); });
    }
  }

  public performSearch(page: number, tapFunction?: (response: GithubSearch) => void) {
    this.repositories = [];

    const observable = this.githubService.getRepositoriesAdvanced(this.form.value, '1', '10');

    if (observable) {
      this.loading = true;
      this.error = false;
      this.emptySearch = false;

      setTimeout(() => document.querySelector('#results').scrollIntoView({ behavior: 'smooth' }));

      observable.pipe(
        tap(response => {
          this.repositories = response.items;
          if (tapFunction) { tapFunction(response); }
        }),
        finalize(() => { this.loading = false; }),
        catchError((error, caught) => {
          console.error(error);
          console.error(caught);

          this.error = true;
          return of(null);
        }),
      ).subscribe();

    } else {
      this.emptySearch = true;
    }
  }

}
