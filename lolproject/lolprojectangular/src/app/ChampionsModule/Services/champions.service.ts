import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BaseService } from 'src/shared/Utils/base-service-request/base-service-request.service';
import { CenterRequestService } from 'src/shared/Utils/center-request/center-request.service';

@Injectable({
  providedIn: 'root',
})
export class ChampionsService extends BaseService {
  constructor(private centerRequestService: CenterRequestService) {
    super();
  }

  listChampions(page: number, size: number): Observable<any> {
    return this.centerRequestService.get(
      `${this.apiListChampionsUrl}champions/pt-br?page=${page}&size=${size}`,this.httpOtionsListChampions.headers
    );
  }

  getChampionByName(page: number, size: number, search: string): Observable<any>{
    return this.centerRequestService.get(
      `${this.apiListChampionsUrl}champions/pt-br?page=${page}&size=${size}&name=${search}`,this.httpOtionsListChampions.headers
    );
  }

}
