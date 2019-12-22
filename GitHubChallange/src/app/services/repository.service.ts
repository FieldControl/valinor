import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepositorySearchResult } from '../models/repository-search-result.model';

const SEARCH_ITEMS_PER_PAGE = 50;

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  constructor(private _http: HttpClient) {}

  public searchRepositoriesByName(name: string): Observable<Object> {
    const url = this._generateSearchInRepositoriesUrl(name);
     let _temp = this._http.get(url,{ observe: 'response' });     
    return _temp;
  }

  public searchRepositoriesByName2(name: string): Observable<HttpResponse<RepositorySearchResult>> {
    const url = this._generateSearchInRepositoriesUrl(name);
     let _temp = this._http.get<RepositorySearchResult>(url,{ observe: 'response' });     
    return _temp;
  }  

  public searchRepositoriesByNameWithPage(name: string,page:number): Observable<HttpResponse<RepositorySearchResult>> {
    const url = this._generateSearchInRepositoriesUrlWithPage(name,page);
     let _temp = this._http.get<RepositorySearchResult>(url,{ observe: 'response' });     
    return _temp;
  }

  private _generateSearchInRepositoriesUrl(name: string): string {
    return `https://api.github.com/search/repositories?q=${name}&per_page=${SEARCH_ITEMS_PER_PAGE}`;
  }

  private _generateSearchInRepositoriesUrlWithPage(name: string, page:number): string {
    return `https://api.github.com/search/repositories?q=${name}&per_page=${SEARCH_ITEMS_PER_PAGE}&page=${page}`;
  }  
}
