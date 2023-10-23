import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  currentQueryService: 'repo' | 'issues' = 'repo';

  constructor() {
    this.currentQueryService = 'repo';
   }

  setCurrentQueryService(service: 'repo' | 'issues') {
    this.currentQueryService = service;
  }

  getCurrentQueryService() {
    return this.currentQueryService;
  }
}
