import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Hero } from '../model/hero.model';

@Injectable({
  providedIn: 'root'
})
export class HeroesService {

  private apiUrl = 'https://api.opendota.com/api/constants/';
  
  private endpointHero = 'heroes'
  private endpointHeroAbility = 'hero_abilities'

  constructor(private http: HttpClient) { }

  public getHeroesData():Observable<Hero[]> {
    return this.http.get<object>(this.apiUrl + this.endpointHero).pipe(
      map((JSONHeroes) => {
      return Object.values(JSONHeroes)
      }))
  }

  public getHeroesAbilityData():Observable<object[]> {
    return this.http.get<object>(this.apiUrl + this.endpointHeroAbility).pipe(
      map((JSONHeroes) => {
      return Object.entries(JSONHeroes)
      }))
  }
}
