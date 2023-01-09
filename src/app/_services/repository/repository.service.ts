import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchResults } from 'src/app/_models/search-results';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  constructor(private http: HttpClient) { }

  getRepositories(searchText: string, currentPage: number): Observable<SearchResults> {
    return this.http.get<SearchResults>(`https://api.github.com/search/repositories?q=${searchText}&per_page=10&page=${currentPage}`);
  }
}
