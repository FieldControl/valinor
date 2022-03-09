import { EventEmitter, Injectable, Output } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { GithubApi } from "src/app/models/Repository.model";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  baseURL = "https://api.github.com";

  @Output() searchQueryObserver: EventEmitter<string> = new EventEmitter();
  @Output() dataChangeObserver: EventEmitter<GithubApi> = new EventEmitter();

  constructor(private snackBar: MatSnackBar, private _httpClient: HttpClient) {}

  showMessage(msg: string, isError: boolean = true) {
    this.snackBar.open(msg, "x", {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
      panelClass: isError ? ["msg-error"] : ["msg-success"],
    });
  }

  find(search: string, page: number = 1): Observable<GithubApi> {
    return this._httpClient
      .get<GithubApi>(
        `${this.baseURL}/search/repositories?q=${search}&&page=${page}`
      )
      .pipe(catchError(this.handleError));
  }

  private handleError = (error: HttpErrorResponse) => {
    if (error.status === 0) {
      console.error("An error occurred:", error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
          `body was: ${error.error.message}`
      );
    }
    return throwError(() =>
      this.showMessage(
        "Ocorreu um erro ao realizar a pesquisa, verifique o termo digitado, conexão com a internet e tente novamente."
      )
    );
  };
}
