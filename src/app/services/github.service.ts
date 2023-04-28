import { Observable } from 'rxjs';
import { GITHUB_API } from '../app.api';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { IProfile, IRepo, IRepoEvent } from '../fragments/profile/profile.interface';

@Injectable({ providedIn: 'root' })
export class GithubService {
  public notifier = new EventEmitter<IRepoEvent>();
  
  constructor(private http: HttpClient) {}

  public getUser(user: string): Observable<IProfile> {
    return this.http.get<IProfile>(`${GITHUB_API}/${user}`);
  }

  public getUserRepos(user: string): Observable<IRepo[]> {
    return this.http.get<IRepo[]>(`${GITHUB_API}/${user}/repos`);
  }

  public updateTable(repo: IRepo[], searchTerm: string): void {
    this.notifier.emit({ repos: repo, searchTerm: searchTerm });
  }
}
