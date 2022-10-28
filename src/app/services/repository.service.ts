import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  private searchUrl: string = '';
  private repositories: any = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {}

  onSearch(inputSearchValue: any) {
    this.searchUrl = 'https://api.github.com/search/repositories?q=';
    let value = inputSearchValue.value;
    this.searchUrl = this.searchUrl + value;
    const valueIsValid = value && value !== '';

    if (valueIsValid) {
      this.repositories = this.http.get(this.searchUrl).pipe(
        map((res: any) => res.items)
      );
    }
    return this.repositories;
  }
}
