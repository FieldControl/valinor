import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RequsitionService } from 'src/shared/services/requisition.center.service';
import * as CryptoJS from 'crypto-js'; // Importe o CryptoJS

@Injectable({
  providedIn: 'root',
})
export class StarWarsService {
  private readonly BASE_URL = `${environment.API_STAR_WARS_PATH}`;

  constructor(private requisitionservice: RequsitionService) {}

  getCharacters(): Observable<any> {
    const url = `${this.BASE_URL}`;
    return this.requisitionservice.get(url);
  }

  getCharactersNextPage(route: any): Observable<any> {
    const url = route;
    return this.requisitionservice.get(url);
  }

  getCharactersPreviousPage(route: any): Observable<any> {
    const url = route;
    return this.requisitionservice.get(url);
  }
}
