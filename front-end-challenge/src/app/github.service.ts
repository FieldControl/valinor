import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  constructor(private http: HttpClient) {}

  getRepos(page: number,perPage: number): Observable<any[]> {
    if(perPage == null){
      perPage = 5
    }
    const url = `https://api.github.com/search/repositories?q=node&page=${page}&per_page=${perPage}`;
    return this.http.get<any[]>(url);
  }
}
