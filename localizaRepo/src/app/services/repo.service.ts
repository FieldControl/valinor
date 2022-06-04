import { EventEmitter, Injectable, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GithubApi } from "../repositorie/repo-repository";
import { Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RepoService {
  private readonly URL = "https://api.github.com";

  @Output() searchQueryObserver: EventEmitter<string> = new EventEmitter();
  @Output() dataChangeObserver: EventEmitter<GithubApi> = new EventEmitter();

  constructor(private httpClient: HttpClient) {}

  find(query: string, page: number = 1): Observable<GithubApi> {
    return this.httpClient
      .get<GithubApi>(
        `${this.URL}/search/repositories?q=${query}&&page=${page}`
      )
      .pipe(
        tap((repos) => {
          console.log(repos);
        })
      );
  }
}
