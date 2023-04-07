import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface MarvelSearchResult {
  results: any[];
  totalResults: number;
}

@Injectable({
  providedIn: 'root',
})
export class MarvelSearchService {
  constructor(private http: HttpClient) {}

  search(type: string, title: string, limit: number, offset: number) {
    return this.http
      // obtem os dados da API, formato "data: { results: {...}, total: number}"
      .get<{ data: { results: any[]; total: number } }>(
        `/${type}?nameStartsWith=${title}&orderBy=name&apikey=${environment.apiKey}&limit=${limit}&offset=${offset}&hash=${environment.apiHash}&ts=${environment.timestamp}`
      )
      // Canaliza os dados para aplicar uma transformação
      .pipe(
        // Mapeia cada elemento
        map((data) => ({
          results: data.data.results,
          totalResults: data.data.total,
        }))
      );
  }
}