import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';
import { Repositories } from "../models/Repositories";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private http: HttpClient) {}

  // Define a function called `searchRepository` that takes in two parameters: a string called `repo` and a number called `page`.
  // The function returns an Observable which emits objects.
  searchRepository(repo: string, page: number): Observable<Object> {
    const params = {
      q: repo,
      page: page,
      per_page: 5,
    };
    return this.http.get(environment.apiUrl, { params });
  }
}
