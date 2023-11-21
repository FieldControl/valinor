import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class GetDataApiGitHub {
  private domain = environment.GITHUB_API_URL;
  private key = environment.GITHUB_API_KEY;
  private messageSource = new BehaviorSubject([]);
  currentMessage = this.messageSource.asObservable();

  constructor(private http: HttpClient) { }

  /*-- Function that fetches data according to user search --*/
  getDataByTerm = (option: string, term: string, page: number, perPage: number): Observable<any> =>
    this.http.get<any>(`${this.domain}/search/${option}`, {
      headers: new HttpHeaders({
        Authorization: `token ${this.key}`
      }),
      params: {
        q: term,
        page: page,
        per_page: perPage.toString(),
      }
    });

  /*-- Function that fetches user data --*/
  getUserDetails = (userName: string): Observable<any> => this.http.get<any>(`${this.domain}/users/${userName}`, {
    headers: new HttpHeaders({
      Authorization: `token ${this.key}`
    }),
  });

  /*-- Function that fetches repository data --*/
  getRepoDetails = (repoName: string): Observable<any> => this.http.get<any>(`${this.domain}/repos/${repoName}`, {
    headers: new HttpHeaders({
      Authorization: `token ${this.key}`
    }),
  });

  /*-- Function that searches data according to a url --*/
  getDataByURL = (url: string): Observable<any> => this.http.get<any>(url);

  changeMessage(message: any): void {
    this.messageSource.next(message);
  }

}
