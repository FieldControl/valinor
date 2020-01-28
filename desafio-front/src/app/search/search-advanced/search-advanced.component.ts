import { Component, OnDestroy, OnInit } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@ng-stack/forms';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import {
  GithubRep,
  GithubRepComp,
  GithubRepOrder,
  GithubRepQuery,
  GithubRepSearchValue,
  GithubRepSort,
  GithubSearch,
  SelectOption,
} from 'models';
import { GithubService } from 'services';
import { FormUtil } from 'utils';


@Component({
  selector: 'app-search-advanced',
  templateUrl: './search-advanced.component.html',
  styleUrls: ['./search-advanced.component.scss'],
})
export class SearchAdvancedComponent implements OnInit, OnDestroy {

  public loading = false;
  public error = false;
  public emptySearch = false;

  public repositories: GithubRep[] = [];

  public readonly loadingIterator = Array(5);
  public readonly subscriptions: Subscription[] = [];

  public currentPage = 1;
  public totalItems = 0;

  public readonly msgs = {
    required: 'Campo obrigatório',
  };

  public readonly optionsSort: SelectOption[] = [
    { name: 'Melhor correspondencia', value: 'best-match' },
    { name: 'N° de estrelas', value: 'stars' },
    { name: 'N° de forks', value: 'forks' },
    { name: 'Ajuda desejada', value: 'help-wanted' },
    { name: 'Data da última atualização', value: 'updated' },
  ];

  public readonly optionsOrder: SelectOption[] = [
    { name: 'Crescente', value: 'asc' },
    { name: 'Decrescente', value: 'desc' },
  ];

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

  public readonly dateOptions: SelectOption[] = [
    { value: '',   name: 'Igual' },
    { value: '>',  name: 'Depois de' },
    { value: '<',  name: 'Antes de' },
    { value: '>=', name: 'Depois ou igual' },
    { value: '<=', name: 'Antes ou igual' },
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

    created: new FormControl<any>(),
    pushed: new FormControl<any>(),

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

    archived: new FormControl<string>(''),
    createdComp: new FormControl<string>(''),
    language: new FormControl<string>(),
    license: new FormControl<string>(),
    mirror: new FormControl<string>(''),
    org: new FormControl<string>(),
    pushedComp: new FormControl<string>(''),
    text: new FormControl<string>(),
    topic: new FormControl<string>(),
    user: new FormControl<string>(),

    is: new FormControl<'public' | 'private' | ''>(''),
  });

  public readonly sortForm = new FormGroup({
    sort: new FormControl<GithubRepSort>('best-match', [Validators.required]),
    order: new FormControl<GithubRepOrder>('desc', [Validators.required]),
  });

  private searchQuery: GithubRepQuery;

  public constructor(
    private readonly githubService: GithubService,
  ) {}

  public ngOnInit() {
    for (const key of ['followers', 'forks', 'goodFirstIssues', 'helpWantedIssues', 'size', 'stars', 'topics']) {
      this.subscriptions.push(
        this.form.controls[key].controls.comp.valueChanges.subscribe((value: string) => {
          if (value === '..') {
            this.form.controls[key].controls.betweenAnd.setValidators([Validators.required]);
          } else {
            this.form.controls[key].controls.betweenAnd.clearValidators();
            this.form.controls[key].controls.betweenAnd.setValue(null);
          }

          this.form.controls[key].controls.betweenAnd.updateValueAndValidity();
        }),
      );
    }
  }

  public ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  public search() {
    FormUtil.touchForm(this.form);

    if (this.form.valid) {
      this.currentPage = 1;
      this.totalItems = 0;
      this.searchQuery = this.form.value;

      this.performSearch(1, (response: GithubSearch) => { this.totalItems = Math.min(response.total_count, 1000); });
    } else {
      window.scrollTo({ behavior: 'smooth', top: (document.querySelector('#title') as HTMLElement).offsetTop - 56 });
    }
  }

  public performSearch(page: number, tapFunction?: (response: GithubSearch) => void) {
    this.repositories = [];

    const observable = this.githubService.getRepositoriesAdvanced(
      this.searchQuery,
      page.toString(10),
      '10',
      this.sortForm.controls.sort.value,
      this.sortForm.controls.order.value,
    );

    if (observable) {
      this.loading = true;
      this.error = false;
      this.emptySearch = false;

      setTimeout(() => {
      window.scrollTo({ behavior: 'smooth', top: (document.querySelector('#results') as HTMLElement).offsetTop - 56 });
      });

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
