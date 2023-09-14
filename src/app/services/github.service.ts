import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RepoSearchResponse } from '../utils/interfaces';
import { API_URL } from '../utils/consts';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private http: HttpClient) { }

  getRepositories(query: string, page: number, sort?: string): Observable<RepoSearchResponse> {
    const url = `${API_URL}?q=${query}&per_page=10&page=${page}&${sort}`;
    return this.http.get<RepoSearchResponse>(url);
  }
}
