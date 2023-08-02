import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {
  private apiUrl = 'https://api.github.com/search/repositories';

  constructor(private http: HttpClient) { }

  searchRepositories(query: string): Observable<any> {
    const url = `${this.apiUrl}?q=${query}`;
    return this.http.get(url).pipe(
      map((response: any) => response.items)
    );
  }
}