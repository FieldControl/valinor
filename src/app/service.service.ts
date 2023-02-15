import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class apiService {
  agents:any = [];

  constructor(private http: HttpClient) {
    this.loadAgents();
  }

  async loadAgents() {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/agents')
      .toPromise();
    const agents = (requisicao.data);
    agents.splice(7,1)
    this.agents = agents;
    }
  
}
