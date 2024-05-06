import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KanbansService {

  constructor(private httClient: HttpClient) { }

  getKanbans(){
    return this.httClient.get('http://localhost:3000/kanbans')
  }
}
