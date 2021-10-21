import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RepositoriesService {
  constructor(private httpClient: HttpClient) {}

  getReposOnSearch(query: string): Observable<[]> {
    return this.httpClient.get<[]>(
      `${environment.apiURL}/search/repositories?q=${query}`
    );
  }
}
