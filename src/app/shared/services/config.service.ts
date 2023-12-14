import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor() {}

  handleError(error: any): Promise<any> {
    console.error('Erro', error);
    return Promise.reject(error.message || error);
  }
}
