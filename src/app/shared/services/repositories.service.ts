import { Injectable } from '@angular/core';
import { catchError, Observable, retry, timeout } from 'rxjs';
import { appSettings } from '../settings/app-settings';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { iReponseRepor } from './../interfaces/repor.interface';
import { ConfigService } from './config.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RepositoriesService {
  private _headers = new HttpHeaders({
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${environment.TOKEN}`,
  });

  constructor(private http: HttpClient, private configService: ConfigService) { }

  getRepositories(user: string): Observable<iReponseRepor> {
    const url = `${appSettings.URL_GITHUB}${user}/repos`;

    return this.http
      .get<iReponseRepor>(url, { headers: this._headers })
      .pipe(
        retry(3),
        timeout(5000),
        catchError(this.configService.handleError)
      );
  }
}
