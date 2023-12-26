import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'https://api.github.com/search/repositories';

  constructor(private http: HttpClient) { }

  getRepos(query: string, page: number, perPage: number): Observable<any> {
    const params = new HttpParams()
    .set('q', query)
    .set('page', page.toString())
    .set('per_page', perPage.toString());

    return this.http.get(this.apiUrl, { params });
  }
}
