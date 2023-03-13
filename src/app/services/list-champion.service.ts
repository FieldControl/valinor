import { Injectable, Input } from '@angular/core';
import { Champion } from '../Champion';
import { debounceTime, map, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ChampionDetails } from '../ChampionDetails';
import { AppModule } from '../app.module';


@Injectable({
  providedIn: 'root',
})
export class ListChampionService {
  url?: string = 'https://jsonserver-kohl-pi.vercel.app/champions?';
 
  
  constructor(
    private httpClient: HttpClient,
    private module: AppModule 
  ){}

  riotKey: string = this.module.key;
  path: string = this.module.path;

  getChampions(
    page: any,
    limit: any,
    text?: string | null
  ): Observable<{ totalCount: number; champions: Champion[] }> {
    return this.httpClient
      .get(
        `https://jsonserver-kohl-pi.vercel.app/champions?_page=${page}&_limit=${limit}&id_like=${
          text || ''
        }`,
        { observe: 'response' }
      )
      .pipe(
        map((response) => {
          return {
            totalCount: Number(response.headers.get('x-total-count')),
            champions: Object.values(response.body || {}) as Champion[],
          };
        })
      );
  }

  getChampion(id: string): Observable<ChampionDetails> {
    return this.httpClient
      .get<{ data: any }>(
        `https://ddragon.leagueoflegends.com/cdn/${this.path}/data/pt_BR/champion/${id}.json`
      )
      .pipe(
        map((response) => {
          return response.data[id];
        })
      );
  }

  getFreeWeekChampions(): Observable<Champion[]> {
    return this.httpClient
      .get<{ freeChampionIds: string[] }>(
        `https://br1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${this.riotKey}`
      )
      .pipe(
        switchMap((response) => {
          const { freeChampionIds } = response;
          const queryParams = freeChampionIds.map((id) => `key=${id}`).join('&');
          return this.httpClient.get<Champion[]>(this.url + queryParams)
        })
      );
  }
  getChampionByKey(championKey1:number, championKey2:number, ChampionKey3:number):Observable<Champion[]>{
    return this.httpClient
    .get<Champion[]>(`https://jsonserver-kohl-pi.vercel.app/champions?key=${championKey1}&key=${championKey2}&key=${ChampionKey3}`)
    .pipe(
      map((response) => {
        return response
      })
    );
  }

}
