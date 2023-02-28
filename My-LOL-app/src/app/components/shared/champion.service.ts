import { Champion } from './champion.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ChampionService {

  constructor(private http: HttpClient) { }

  BaseUrl = 'http://localhost:3000'

  createDataBase() {
    return this.http.get(this.BaseUrl)
  }

  getChampions(offset: number, limit: number) {
    return this.http.get<Champion[]>(`${this.BaseUrl}/${offset}/${limit}`)
  }

  findChampion(name: string | null) {
    return this.http.get<Champion[]>(`${this.BaseUrl}/${name}`)
  }
}
