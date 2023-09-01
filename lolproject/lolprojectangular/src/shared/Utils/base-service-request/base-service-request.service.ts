import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  httpOtionsListChampions = {
    headers: new HttpHeaders({
      'X-Rapidapi-Key': environment.API_LOL_CHAMPIONS_KEY,
    }),
  };

  httpOtionsChampionsRotation = {
    headers: new HttpHeaders({
      'X-Riot-Token': environment.API_LOL_CHAMPIONS_ROTATION_KEY,
    }),
  };

  apiListChampionsUrl: any = environment.API_LOL_CHAMPIONS_URL;
  apiRotationChampionsUrl: any = environment.API_LOL_CHAMPIONS_ROTATION_URL
  apiAuthenticationUrl: any = environment.API_AUTHENTICATION;

  constructor() {}
}
