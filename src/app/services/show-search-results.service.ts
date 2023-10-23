import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShowSearchResultsService {
  showR_b: boolean = true;
  showI_b: boolean = false;
  showCR_b: boolean = false;
  showCI_b: boolean = false;
  constructor() { }

}
