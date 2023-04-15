import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiGoogleBooksService {

  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) { }

  searchBooks(query: string, startIndex: number, maxResults: number): Observable<{ totalItems: any; items: any[]; }> {
    const url = `${this.apiUrl}?q=${query}&startIndex=${startIndex}&maxResults=${maxResults}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        const totalItems = response.totalItems || 0;
        return { totalItems, items: response.items || [] };
      })
    );
  }
}
