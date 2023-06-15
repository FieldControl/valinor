import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';

//#region Injetável
@Injectable({
  providedIn: 'root',
})
export class RequsitionService {
  constructor(private http: HttpClient, private router: Router) {}

  //#region Buscas
  get(route: any): Observable<any> {
    return this.http.get(`${route}`).pipe(tap());
  }
  //#endregion
}
