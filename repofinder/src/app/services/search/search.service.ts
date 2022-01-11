import { EventEmitter, Injectable, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GithubApi } from 'src/app/models/Repository.model';
import { EMPTY, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  baseURL= 'https://api.github.com';

  @Output() searchQueryObserver : EventEmitter<string> = new EventEmitter();
  @Output() dataChangeObserver: EventEmitter<GithubApi> = new EventEmitter();

  constructor(private snackBar: MatSnackBar, private _httpClient: HttpClient)  { }

  find(search: string, page: number = 1) {
    this._httpClient.get<GithubApi>(`${this.baseURL}/search/repositories?q=${search}&&page=${page}`)
      .subscribe(
        response => this.dataChangeObserver.emit(response),
        error => this.errorHandler(error)
      );
  }

  errorHandler(e: HttpErrorResponse): Observable<any> {
    if (e.status === 422) {
      this.showMessage('Digite algum termo para pesquisa');
    } else {
      this.showMessage('Ocorreu um erro ao pesquisar')
    }    
    return EMPTY;
  }
  
  showMessage(msg: string, isError: boolean = true): void {
    this.snackBar.open(msg, "X", {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: isError ? ["msg-error"] : ["msg-success"],
    });
  }
}



