import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CenterRequestService {
  constructor(private http: HttpClient, private router: Router) {}

  get(route: any, headers?: HttpHeaders): Observable<any> {
    const options = { headers };
    return this.http.get(`${route}`, options).pipe(tap());
  }

  post(route: any, data: any, headers?: HttpHeaders): Observable<any> {
    const options = { headers };
    return this.http.post(`${route}`, data, options).pipe(tap());
  }

  put(route: any, data: any, headers?: HttpHeaders): Observable<any> {
    const options = { headers };
    return this.http.put(`${route}`, data, options).pipe(tap());
  }

  delete(route: any, headers?: HttpHeaders): Observable<any> {
    const options = { headers };
    return this.http.delete(`${route}`, options).pipe(tap());
  }
}
