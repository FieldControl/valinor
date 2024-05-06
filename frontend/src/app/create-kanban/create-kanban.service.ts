import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {IKanban} from '../interfac/InterfaceKanban'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateKanbanService {

  constructor(private http: HttpClient) { }

  createKanban(dados: IKanban) {
     const url = 'http://localhost:3000/kanbans';
     this.http.post(url, dados); 
  } 
}
