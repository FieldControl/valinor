import {Injectable} from '@angular/core';
import {HomeService} from "../home/home.service";

@Injectable({
  providedIn: 'root'
})
export class PaginatorService {


  constructor(public homeService: HomeService) {

    }
}



