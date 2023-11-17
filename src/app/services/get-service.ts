import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class GetDataApiGitHub {
  private domain = environment.GITHUB_API_URL;
  private messageSource = new BehaviorSubject([]);
  currentMessage = this.messageSource.asObservable();

  constructor(private http: HttpClient) { }

  /*-- Function that fetches data according to user search --*/
  getDataByTerm = (option: string, term: string, page: number, perPage: number): Observable<any> =>
    this.http.get<any>(`${this.domain}/search/${option}`, {
      params: {
        q: term,
        page: page,
        per_page: perPage.toString(),
      }
    });

  /*-- Function that fetches user data --*/
  getUserDetails = (userName: string): Observable<any> => this.http.get<any>(`${this.domain}/users/${userName}`);

  /*-- Function that fetches repository data --*/
  getRepoDetails = (repoName: string): Observable<any> => this.http.get<any>(`${this.domain}/repos/${repoName}`);

  /*-- Function that searches data according to a url --*/
  getDataByURL = (url: string): Observable<any> => this.http.get<any>(url);

  changeMessage(message: any): void {
    this.messageSource.next(message);
  }

}
