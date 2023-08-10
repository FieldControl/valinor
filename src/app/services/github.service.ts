import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, retry } from 'rxjs';
import { environment } from 'src/environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class GithubServiceApi {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(endpoint: string, params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${endpoint}`,{
      params: params,
    })
    .pipe(retry(3), catchError(this.handleError));
  }

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
}
}
