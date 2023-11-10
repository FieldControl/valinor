import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, startWith, combineLatest } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  mergeMap,
  switchMap
} from 'rxjs/operators';
import { GetDataApiGitHub } from '../../services/get-service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  openModal: boolean = false;
  totalPage: (number)[] = [12, 18, 24, 32];
  perPage: number = 12;
  currentPage: number = 1;
  options: (string)[] = ['Repositórios', 'Usuários'];
  option: string = 'repositories';
  term: string = 'javascript';
  selectedOptionIndex: number = 0;

  searchForm: FormGroup
  optionField: FormControl;
  searchField: FormControl;
  perPageField: FormControl;

  constructor(
    private formBuilder: FormBuilder,
    private searchDataService: GetDataApiGitHub,
    private loc: Location,
    private route: Router,
  ) {
    this.optionField = new FormControl('', [
      Validators.required
    ]);
    this.searchField = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]);
    this.perPageField = new FormControl();
    this.searchForm = this.formBuilder.group({
      optionField: this.optionField,
      searchField: this.searchField,
      perPageField: this.perPageField
    });
  }

  ngOnInit(): void {
    this.search().subscribe((data: any) => {
      let option = this.optionField.value ? this.optionField.value : this.option;
      let term = this.searchField.value ? this.searchField.value : this.term;
      let perPage = this.perPageField.value ? this.perPageField.value : this.perPage;

      this.searchDataService.changeMessage([option, term, data, this.currentPage, perPage] || []);
    });

    document.addEventListener('click', this.onClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onClickOutside.bind(this));
  }

  search() {
    this.isLoading = true;
    return combineLatest([
      this.searchField.valueChanges.pipe(startWith(this.term)),
      this.optionField.valueChanges.pipe(startWith(this.option)),
      this.perPageField.valueChanges.pipe(startWith(this.perPage))
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(([term, option, perPage]) => {

        if (term.length >= 3) {
          if (this.loc.path()) {
            this.route.navigate(['/']);
          }
          return this.searchDataService.getDataByTerm(option, term, this.currentPage, perPage)
            .pipe(
              map((response: any) => {
                const { items } = response;
                return { items };
              }),
              switchMap(({ items }) => {
                const obs$ = items.map((item: any) => {
                  return this.searchDataService.getDataByURL(item.url);
                });
                return forkJoin(obs$).pipe(
                  mergeMap((items) => {
                    this.isLoading = false;
                    return of({ items });
                  })
                );
              })
            );
        }
        return of([]);
      })
    );
  }

  OpenModal(e: Event): void {
    e.stopPropagation()
    this.openModal = !this.openModal
  }

  onClickOutside(event: any) {
    const modalContainer = document.querySelector('.search-filter');

    if (modalContainer && !modalContainer.contains(event.target)) {
      this.openModal = false;
    }
  }

  getOption(value: number) {
    this.perPage = value;
    this.perPageField.setValue(this.perPage);
    this.openModal = !this.openModal;
  }
}
