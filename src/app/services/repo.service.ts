import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShowSearchResultsService } from './show-search-results.service';

@Injectable({
  providedIn: 'root'
})
export class RepoService {
  query: string='';
  repos: any = {items:[]};
  currentPage: number = 1;
  pageSize: number = 30;
  constructor(private http: HttpClient) { }

  searchRepo(page: number, perPage: number) {
    const apiUrl = `https://api.github.com/search/repositories?q=${this.query}&page=${page}&per_page=${perPage}`;
    return this.http.get(apiUrl).subscribe((data) => {
      this.repos = data;
    });
  }
}
