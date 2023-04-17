import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { ResultCharacter } from './models/marvel-character';
import { map, switchMap } from 'rxjs/operators';
import { ResultComics } from './models/marvel-comics';
import { ResultEvents } from './models/marvel-events';
import { ResultSeries } from './models/marvel-series';
import { ResultCreators } from './models/marvel-creators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarvelSearchService {
  constructor(private http: HttpClient) {}
  getResults(type: string, limit: number = 5, pageIndex?: number, searchText?: string): Observable<{ results: ResultCharacter[] | 
                                                                                         ResultComics[] | 
                                                                                         ResultEvents[] | 
                                                                                         ResultSeries[] | 
                                                                                         ResultCreators[]; 
                                                                                totalResults: number;}> {
    // Inicio dos comandos da função "getResults"
    pageIndex = pageIndex || 0;
    const offset = limit * pageIndex;
    let resultObservable: Observable<{
      results:
        | ResultCharacter[]
        | ResultComics[]
        | ResultEvents[]
        | ResultSeries[]
        | ResultCreators[];
      totalResults: number;
    }> = of({ results: [], totalResults: limit });

    const url = `/`+type+`?apikey=${environment.apiKey}&limit=${limit}&offset=${offset}&hash=${environment.apiHash}&ts=${environment.timestamp}` + (searchText ? `&`+((type == 'comics' || type == 'series')?'title':'name')+`StartsWith=${searchText}` : '');
    switch (type) {
      case 'characters':
        resultObservable = this.getMarvelData<ResultCharacter>(url);
        break;
      case 'comics':
        resultObservable = this.getMarvelData<ResultComics>(url);
        break;
      case 'events':
        resultObservable = this.getMarvelData<ResultEvents>(url);
        break;
      case 'series':
        resultObservable = this.getMarvelData<ResultSeries>(url);
        break;
      case 'creators':
        resultObservable = this.getMarvelData<ResultCreators>(url);
        break;
    }

     return resultObservable;
   }

   // Função genérica, para trazer os dados já no formato correto.
   private getMarvelData<T>(urlRoute: string): Observable<{ results: T[], totalResults: number }> {
    return this.http.get<{ data: { results: T[], total: number } }>(environment.apiUrl + urlRoute)
      .pipe(
        switchMap((response: { data: { results: T[], total: number } }) => {
          const results = response.data.results;
          const totalResults = response.data.total;
  
          // Mapeia cada elemento
          return forkJoin(
            results.map((item: T) => {
              const description = (item as any).description;
              if (description) {
                // Traduz a descrição
                return this.translate(description).pipe(
                  map(translatedDescription => {
                    // Atualiza a descrição com a tradução
                    (item as any).description = translatedDescription;
                    return item;
                  })
                );
              } else {
                return of(item);
              }
            })
          ).pipe(
            map(translatedResults => ({ results: translatedResults, totalResults }))
          );
        })
      );
  }
  
  private translate(text: string): Observable<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
  
    return this.http.get<any[][]>(url).pipe(
      map(response => {
        let translatedText = '';
  
        if (Array.isArray(response[0])) {
          for (const item of response[0]) {
            if (Array.isArray(item)) {
              translatedText += item[0];
            }
          }
        }
  
        return translatedText;
      })
    );
  }
}