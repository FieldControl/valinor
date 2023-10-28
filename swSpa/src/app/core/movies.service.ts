import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Film } from '../models/film.model'
import { Observable, forkJoin } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  constructor(private http: HttpClient) { }

getMultiFilms (urls: string[]) {
  const urlFilms = urls.map(url => this.getFilmData(url))

  return forkJoin(urlFilms);
}


private getFilmData(url: string): Observable<Film> {
  return this.http.get<Film>(url);
}
 


}
