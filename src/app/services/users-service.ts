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
  private query = '?q=';
  private messageSource = new BehaviorSubject([]);
  currentMessage = this.messageSource.asObservable();

  constructor(private http: HttpClient) { }

  getAllUsers = (): Observable<any> =>
    this.http.get<any>(`${this.domain}/users`, {
      headers: new HttpHeaders({
        Authorization: `token ${this.key}`,
      }),
    });

  getUsersByName = (userName: string): Observable<any> =>
    this.http.get<any>(`${this.domain}/search/users${this.query}${userName}`, {
      headers: new HttpHeaders({
        Authorization: `token ${this.key}`,
      }),
    });

  getUserDetails = (userName: string): Observable<any> =>
    this.http.get<any>(`${this.domain}/users/${userName}`, {
      headers: new HttpHeaders({
        Authorization: `token ${this.key}`,
      }),
    });

  getUserByURL = (url: string): Observable<any> =>
    this.http.get<any>(url, {
      headers: new HttpHeaders({
        Authorization: `token ${this.key}`,
      }),
    });

  changeMessage(message: any): void {
    this.messageSource.next(message);
  }
}
