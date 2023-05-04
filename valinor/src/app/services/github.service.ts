import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

const API = 'https://api.github.com/search';

const APICount = 'https://github.com/search/count';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  constructor(private http: HttpClient) {}
  APICount = 'https://github.com/search/count';
  API = 'https://api.github.com/search';

  getRepositories(text: string, index: number, type: any): Observable<any> {
    console.log(text);

    return this.http.get<any>(`${API}/${type}`, {
      params: {
        q: text,
        page: index,
      },
    });
  }

  getUserCount(text: string): Observable<any> {
    return this.http.get(`${APICount}?q=${text}&type=users`);
  }
}
