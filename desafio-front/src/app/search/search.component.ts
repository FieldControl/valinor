import { Component } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@ng-stack/forms';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

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
export class SearchComponent {

  public loading = false;
  public error = false;
  public repositories: GithubRep[] = [];
  public loadingIterator = Array(5);

  public currentPage = 0;
  public totalItems = 0;

  public readonly msgs = {
    required: 'Campo obrigatório',
  };

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

  private searchQuery: string;


  public constructor(
    private readonly githubService: GithubService,
  ) { }

  public search() {
    FormUtil.touchForm(this.form);

    if (this.form.valid) {
      this.currentPage = 1;
      this.totalItems = 0;
      this.searchQuery = this.form.controls.searchText.value;

      this.performSearch(1, (response: GithubSearch) => { this.totalItems = Math.min(response.total_count, 1000); });
    }
  }

  public performSearch(page: number, tapFunction?: (response: GithubSearch) => void) {
    this.loading = true;
    this.error = false;

    this.repositories = [];

    setTimeout(() => {
      window.scrollTo({ behavior: 'smooth', top: (document.querySelector('#results') as HTMLElement).offsetTop - 56 });
    });

    this.githubService.getRepositoriesSimple(
      this.searchQuery,
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
