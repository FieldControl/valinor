import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from './item';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  limit = 9;
  skip = 0;
  currentPage = 0;
  numOfPages = 0;
  error = '';

  items: Item[] = [];

  searchUpdate = new BehaviorSubject<{
    numOfPages: number;
    items: Item[];
    currentPage: number;
    error: string;
  }>({
    numOfPages: 0,
    items: [],
    currentPage: 0,
    error: '',
  });

  constructor(private http: HttpClient) {}

  search(login: string) {
    this.http
      .get<Item[]>(`https://api.github.com/search/repositories?q=${login} in:login`)
      .pipe(
        map((results: any) =>
          results.items.map((item: any) => ({
            avatar_url: 'https://avatars.githubusercontent.com/u/2918581?v=4'/*item.avatar_url*/,
            login: item.name,
            type: item.type,
            description: item.description
          }))
        )
      )
      .subscribe(
        (items) => {
          this.items = items;
          this.numOfPages = this.getNumOfPages();
          this.currentPage = 1;
          this.error = '';
          this.sort('login', true);
        },
        (error) => {
          this.error = error.message;
          this.searchUpdate.next({
            numOfPages: 0,
            currentPage: 0,
            items: [],
            error: this.error,
          });
        }
      );
  }

  getNumOfPages() {
    const r = parseInt((this.items.length / this.limit).toFixed());
    if (this.items.length - r * this.limit > 0) return r + 1;
    return r;
  }

  getItems() {
    return this.items.slice(this.skip, this.skip + this.limit);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  goToPage(i: number) {
    if (i < 1 || i > this.numOfPages) return;

    this.skip = (i - 1) * this.limit;
    this.currentPage = i;
    this.searchUpdate.next({
      numOfPages: this.numOfPages,
      currentPage: this.currentPage,
      items: this.getItems(),
      error: '',
    });
  }

  sort(column: string, direction: boolean) {
    if (direction)
      this.items.sort((a: any, b: any) => a[column].localeCompare(b[column]));
    else
      this.items.sort((a: any, b: any) => b[column].localeCompare(a[column]));
    this.searchUpdate.next({
      numOfPages: this.numOfPages,
      currentPage: this.currentPage,
      items: this.getItems(),
      error: '',
    });
  }
}
