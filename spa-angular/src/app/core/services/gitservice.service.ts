
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { gitModel, searchRepoModel } from '../models/git.model';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';




@Injectable({
  providedIn: 'root'
})
export class GitserviceService {

  private repo_API = environment.API_URL_REPO;
  @Output() getReposGitHub: EventEmitter<[searchRepoModel, string]> = new EventEmitter();


  constructor(private _http: HttpClient, private _snackBar: MatSnackBar) { }

  public getSearchReposGitHub(repoName: string, pageNumber: number, pageSize: number): Observable<searchRepoModel> {
    const url = `${this.repo_API}/search/repositories?q=${repoName}&page=${pageNumber}&per_page=${pageSize}`;
    return this._http.get<searchRepoModel>(url).pipe(
      catchError((err) => {
        this._snackBar.open(`${err.error.message}`, '', {
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        return throwError(err);
      })
    );
  }
}
