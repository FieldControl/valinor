import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CryptoCoin } from '../models/crypto-coin';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CoinMarketCapAPIService {
  private urlApi: string = '';
  private keyApi: string = '';
  private data: CryptoCoin | any;
  limit: number = 5
  convert: string = 'BRL'


  constructor(private http: HttpClient) {
    this.urlApi = environment.API_URL;
    this.keyApi = environment.API_KEY;
  }

  getCryptoData(): Observable<CryptoCoin> {
    this.data = this.http.get<CryptoCoin>(`${this.urlApi}?limit=${this.limit}&convert=${this.convert}`, {
      headers: {
        'X-CMC_PRO_API_KEY': `${this.keyApi}`,
        Accept: 'application/json',
      },
    });
    return this.data;
  }
}
