import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'https://api.github.com';

  constructor(private http: HttpClient) { }

  searchRepositories(query: string, page: number): Observable<any> {
    const params = new HttpParams()
      .set('q', query)
      .set('per_page', '10')
      .set('page', page.toString());

    return this.http.get(`${this.apiUrl}/search/repositories`, { params });
  }
}
