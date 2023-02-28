import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class apiService {
  bundles: any = [];
  agents: any = [];
  skins: any = [];

  constructor(private http: HttpClient) {
    this.loadBundles();
    this.loadAgents();
    this.loadSkins();
  }

  async loadBundles() {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/bundles/?language=pt-BR')
      .toPromise();
    const bundles = requisicao.data;
    this.bundles = bundles;
  }
  async loadAgents() {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/agents/?isPlayableCharacter=true&language=pt-BR')
      .toPromise();
    const agents = requisicao.data;
    this.agents = agents;
    console.log(this.agents)
  }
  async loadSkins() {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/weapons/skins/?language=pt-BR')
      .toPromise();
    const skins = requisicao.data;
    this.skins = skins;
    console.log(skins)
  }
}
