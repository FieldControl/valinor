import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FormControl, FormGroup, Validators } from '@ng-stack/forms';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { validationMessages } from 'constants';
import { GithubRep, GithubRepOrder, GithubRepSort, GithubSearch, SelectOption } from 'models';
import { GithubService } from 'services';
import { FormUtil } from 'utils';


interface SearchForm {
  searchText: string;
  sort: GithubRepSort;
  order: GithubRepOrder;
}


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

  public loading = false;
  public error = false;
  public repositories: GithubRep[] = [];
  public loadingIterator = Array(10);

  public currentPage = 0;
  public totalItems = 0;

  public readonly msgs = validationMessages;

  public readonly form: FormGroup<SearchForm> = new FormGroup({
    searchText: new FormControl<string>(null, [Validators.required]),
    sort: new FormControl<GithubRepSort>('best-match', [Validators.required]),
    order: new FormControl<GithubRepOrder>('desc', [Validators.required]),
  });

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


  public constructor(
    private readonly githubService: GithubService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }

  public ngOnInit() {
    if (this.route.snapshot.queryParams.t) {
      this.form.controls.searchText.setValue(this.route.snapshot.queryParams.t);
      this.form.controls.sort.setValue(this.route.snapshot.queryParams.s || 'best-match');
      this.form.controls.order.setValue(this.route.snapshot.queryParams.o || 'desc');

      this.form.updateValueAndValidity();

      this.performSearch(1, (response: GithubSearch) => { this.totalItems = Math.min(response.total_count, 1000); });

    } else if (Object.keys(this.route.snapshot.queryParams).length) {
      this.router.navigate(['']);
    }
  }

  public search() {
    FormUtil.touchForm(this.form);

    if (this.form.valid) {
      this.router.navigate([''], { queryParams: {
        t: this.form.controls.searchText.value,
        s: this.form.controls.sort.value,
        o: this.form.controls.order.value,
      }});

      this.currentPage = 1;
      this.totalItems = 0;

      this.performSearch(1, (response: GithubSearch) => { this.totalItems = Math.min(response.total_count, 1000); });
    }
  }

  public performSearch(page: number, tapFunction?: (response: GithubSearch) => void) {
    this.loading = true;
    this.error = false;

    this.repositories = [];

    setTimeout(() => document.querySelector('#results').scrollIntoView({ behavior: 'smooth' }));

    this.githubService.getRepositoriesSimple(
      this.form.controls.searchText.value,
      page.toString(10),
      '10',
      this.form.controls.sort.value,
      this.form.controls.order.value,
    ).pipe(
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
  }
}
