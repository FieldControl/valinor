import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Repository } from '../models/repository';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private RepositoryApiURL = environment.RepositoryApiURL;
  private IssueApiURL = environment.IssueApiURL;

  constructor(private http: HttpClient) {}

  getRepositories(page : number = 1, perPage : number = 10, search : string = "kaiogotyacode"){
    return this.http.get<Repository>(`${this.RepositoryApiURL}?q=${search}&page=${page}&perPage=${perPage}`);
  }

  getIssues(userName : string = "kaiogotyacode", userRepository : string = "taskManagement"){
    return this.http.get<Repository>(`${this.IssueApiURL}?q=repo:${userName}/${userRepository}`);
  }


}
