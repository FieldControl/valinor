import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repository } from './models/repository.model';
import { RepositoryList } from './models/repository-list.model';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'https://api.github.com';

  constructor(private http: HttpClient) { }

  searchRepositories(query: string, page: number): Observable<RepositoryList> {
    const perPage = 10; // Número de resultados por página
    const url = `${this.apiUrl}/search/repositories?q=${query}&page=${page}&per_page=${perPage}`;

    return this.http.get<RepositoryList>(url);
  }
  getAllRepositories(): Observable<any> {
    const perPage = 100; // Obter 100 repositórios por página
    const url = `${this.apiUrl}/repositories?per_page=${perPage}`;

    return this.http.get(url);
  }
}