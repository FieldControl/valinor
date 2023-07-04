import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { throwError } from "rxjs";
import { environment } from 'src/environment/environment';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepositoriosService {

  private API = 'repositories';

  constructor(private httpClient: HttpClient) { }

  obterRepositorio(nome: string | null) {
    let params = new HttpParams();

    if (nome) {
      params = params.set('q', nome);
    }

    return this.httpClient.get<any>(`${environment.BASE_URL + this.API}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  protected handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(() => error);
  }
}
