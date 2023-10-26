import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { People } from '../models/people.model';

@Injectable({
  providedIn: 'root'
})
export class StarWarsService {

  private baseUrl = environment.api

  constructor(private http: HttpClient) { }

  getPeople() {
    return this.http.get<People[]>(`${this.baseUrl}people/`);
  }

  searchPeople(query: string) {
    return this.http.get<People[]>(`${this.baseUrl}people/?search=${query}`);
  }

  getPagination(page: any) {
    return this.http.get<People[]>(`${this.baseUrl}people/?page=${page}`);
  }
}
