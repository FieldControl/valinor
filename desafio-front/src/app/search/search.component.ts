import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { FormControl, FormGroup, Validators } from '@ng-stack/forms';

import { GithubRepOrder, GithubRepSort, SelectOption } from 'models';
import { FormUtil } from 'utils';

import { validationMessages } from 'constants';


interface SearchForm {
  searchText: string;
  sort: GithubRepSort;
  order: GithubRepOrder;
}


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {

  public readonly form: FormGroup<SearchForm> = new FormGroup({
    searchText: new FormControl<string>(null, [Validators.required]),
    sort: new FormControl<GithubRepSort>('best-match', [Validators.required]),
    order: new FormControl<GithubRepOrder>('desc', [Validators.required]),
  });

  public readonly optionsSort: SelectOption[] = [
    { name: 'Melhor correspondencia', value: 'best-match' },
    { name: 'N° de estrelas', value: 'stars' },
    { name: 'M° de forks', value: 'forks' },
    { name: 'Ajuda desejada', value: 'help-wanted' },
    { name: 'Data da última atualização', value: 'updated' },
  ];

  public readonly optionsOrder: SelectOption[] = [
    { name: 'Crescente', value: 'asc' },
    { name: 'Decrescente', value: 'desc' },
  ];

  public readonly msgs = validationMessages;


  public constructor(
    private readonly router: Router,
  ) { }

  public search() {
    FormUtil.touchForm(this.form);

    if (this.form.valid) {
      this.router.navigate(['resultados'], { queryParams: {
        t: this.form.controls.searchText.value,
        s: this.form.controls.sort.value,
        o: this.form.controls.order.value,
      } },
      );
    }
  }
}
