import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'https://api.github.com/search/repositories';
  private perPage = 10;

  constructor(private http: HttpClient) { }

  searchRepositories(query: string, page: number): Observable<any> {
    const params = {
      q: query,
      per_page: this.perPage.toString(),
      page: page.toString()
    };
    return this.http.get(this.apiUrl, { params });
  }
}
