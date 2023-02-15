import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class apiService {
  agents = [];

  constructor(private http: HttpClient) {
    this.loadAgents();
  }

  async loadAgents() {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/agents')
      .toPromise();
    this.agents = (requisicao.data);
    console.log(this.agents)
  }
}
