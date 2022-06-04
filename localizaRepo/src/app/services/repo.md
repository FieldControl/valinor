import { EventEmitter, Injectable, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GithubApi } from "../repositorie/repo-repository";
import { Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RepoService {
  private readonly URL = "https://api.github.com/";

  @Output() queryObserver: EventEmitter<string> = new EventEmitter();
  @Output() dataObserver: EventEmitter<GithubApi> = new EventEmitter();

  //search/repositories?q=repofinder

  constructor(private httpClient: HttpClient) {}

  find(search: string, page : number = 1): Observable<GithubApi> {
    return this.httpClient
      .get<GithubApi>(`${this.URL}/search/repositories?q=${search}&&page=${page}`)
      .pipe(tap((repos) => console.log(repos)));
  }
}



<img
          class="icon-search"
          src="./assets/magnifying-glass-solid.svg"
          alt="search"
          ((click)="find(serach.value)"
        />