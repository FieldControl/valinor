import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RequsitionService } from 'src/shared/services/requisition.center.service';
import * as CryptoJS from 'crypto-js'; // Importe o CryptoJS

@Injectable({
  providedIn: 'root',
})
export class MarvelService {
  private readonly API_KEY_PUBLIC = `${environment.API_MARVEL_PUBLIC_KEY}`;
  private readonly API_KEY_PRIVATE = `${environment.API_MARVEL_PRIVATE_KEY}`;
  private readonly BASE_URL = `${environment.API_MARVEL_PATH}`;

  constructor(private requisitionservice: RequsitionService) {}

  getCharacters(): Observable<any> {
    const time = Date.now;
    const hash = CryptoJS.MD5(
      time + this.API_KEY_PRIVATE + this.API_KEY_PUBLIC
    ).toString(); // Gere o hash usando tempo, chave privada e chave pública
    const url = `${this.BASE_URL}/characters?ts=${time}&apikey=${this.API_KEY_PUBLIC}&hash=${hash}`;
    return this.requisitionservice.get(url);
  }
}
