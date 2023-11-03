import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class GithubService {
  private serviceAPI = 'https://api.github.com';

  constructor(private httpClient : HttpClient) {}

  getUser(username: string) {
    return this.httpClient.get(`${this.serviceAPI}/users/${username}`);
  }
  getRepo(username: string) {
    return this.httpClient.get(`${this.serviceAPI}/users/${username}/repos`);
  }

}
