import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private RepositoryApiURL = environment.RepositoryApiURL;
  private IssueApiURL = environment.IssueApiURL;

  constructor(private http: HttpClient) {}

  getRepositories(){
    // return this.http.get<Modelo>(this.RepositoryApiURL);
  }


}
