import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  iResponseCreateIssue,
  iResponseEdit,
  iResponseListarIssue,
  LockIssue,
  newIssue,
} from '../interfaces/issue.interface';
import { appSettings } from '../settings/app-settings';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class IssuesService {
  private _headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: environment.TOKEN,
  };

  private _headersTwo = {
    Accept: 'application/vnd.github+json',
    Authorization: environment.TOKEN,
  };

  constructor(private http: HttpClient, private configService: ConfigService) {}

  searchIssues(user: string, repo: string): Observable<iResponseListarIssue> {
    const url = `${appSettings.URL_ISSUES}${user}/${repo}/issues`;

    return this.http
      .get<iResponseListarIssue>(url, { headers: this._headers })
      .pipe(
        retry(3),
        timeout(5000),
        catchError(this.configService.handleError)
      );
  }

  createIssues(
    user: string,
    repo: string,
    request: newIssue
  ): Observable<iResponseCreateIssue> {
    const url = `${appSettings.URL_ISSUES}${user}/${repo}/issues`;

    return this.http
      .post<iResponseCreateIssue>(url, request, { headers: this._headersTwo })
      .pipe(
        retry(3),
        timeout(5000),
        catchError(this.configService.handleError)
      );
  }

  patchIssues(
    user: string,
    repo: string,
    issue: number,
    request: newIssue
  ): Observable<iResponseEdit> {
    const url = `${appSettings.URL_ISSUES}${user}/${repo}/issues/${issue}`;

    return this.http
      .patch<iResponseEdit>(url, request, { headers: this._headersTwo })
      .pipe(
        retry(3),
        timeout(5000),
        catchError(this.configService.handleError)
      );
  }

  LockIssues(
    user: string,
    repo: string,
    issue: number,
    request: LockIssue
  ): Observable<any> {
    const url = `${appSettings.URL_ISSUES}${user}/${repo}/issues/${issue}/lock`;

    return this.http
      .put<any>(url, request, { headers: this._headersTwo })
      .pipe(
        retry(3),
        timeout(5000),
        catchError(this.configService.handleError)
      );
  }
}
