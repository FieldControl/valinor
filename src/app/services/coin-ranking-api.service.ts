import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataCoinRanking } from '../models/crypto-coin';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CoinRankingAPIService {
  private urlApi: string = '';
  private keyApi: string = '';
  apiData: DataCoinRanking | any;
  search: string = '';
  limit: number = 8;
  offset: number = 0;

  constructor(private http: HttpClient) {
    this.urlApi = environment.API_URL;
    this.keyApi = environment.API_KEY;
  }

  getCryptoData(): Observable<DataCoinRanking> {
    this.apiData = this.http.get<DataCoinRanking>(`${this.urlApi}/coins?limit=${this.limit}&search=${this.search}&offset=${this.offset}&tier=1`, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': this.keyApi,
      },
    });
    return this.apiData;
  }
}
