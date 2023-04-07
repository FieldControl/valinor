import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ResultCharacter, DataCharacter } from './models/marvel-character';
import { map } from 'rxjs/operators';
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
  getResults(type: string, searchText: string, limit: number = 5, pageIndex?: number): Observable<{ results: ResultCharacter[] | 
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

    switch (type) {
      case 'characters':
        resultObservable = this.getMarvelData<ResultCharacter>(
          `/characters?nameStartsWith=${searchText}&apikey=${environment.apiKey}&limit=${limit}&offset=${offset}&hash=${environment.apiHash}&ts=${environment.timestamp}`
        );
        break;
      case 'comics':
        resultObservable = this.getMarvelData<ResultComics>(
          `/comics?titleStartsWith=${searchText}&apikey=${environment.apiKey}&limit=${limit}&offset=${offset}&hash=${environment.apiHash}&ts=${environment.timestamp}`
        );
        break;
      case 'events':
        resultObservable = this.getMarvelData<ResultEvents>(
          `/events?nameStartsWith=${searchText}&apikey=${environment.apiKey}&limit=${limit}&offset=${offset}&hash=${environment.apiHash}&ts=${environment.timestamp}`
        );
        break;
      case 'series':
        resultObservable = this.getMarvelData<ResultSeries>(
          `/series?titleStartsWith=${searchText}&apikey=${environment.apiKey}&limit=${limit}&offset=${offset}&hash=${environment.apiHash}&ts=${environment.timestamp}`
        );
        break;
      case 'creators':
        resultObservable = this.getMarvelData<ResultCreators>(
          `/creators?nameStartsWith=${searchText}&apikey=${environment.apiKey}&limit=${limit}&offset=${offset}&hash=${environment.apiHash}&ts=${environment.timestamp}`
        );
        break;
    }

     return resultObservable;
   }

   // Função genérica, para trazer os dados já no formato correto.
   private getMarvelData<T>(urlRoute:string):Observable<{results:T[],totalResults:number}>{
     return this.http.get<{ data:{results:T[],total:number}}>(environment.apiUrl + urlRoute)
      .pipe(// Função que canaliza dos dados
        // Mapeia cada elemento
        map(response=>({results:response.data.results,
                        totalResults:response.data.total}))
      );
   }
}