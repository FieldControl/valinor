import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BundleListComponent } from './components/lists/bundle-list/bundle-list.component';

@Injectable({
  providedIn: 'root',
})
export class apiService implements OnInit {
  bundles: any = [];
  agents: any = [];
  skins: any = [];
  
  constructor(private http: HttpClient) {
    this.loadBundles();
    this.loadAgents();
    this.loadSkins();
  }
  ngOnInit(): void {
    this.bundles;
    this.agents;
    this.skins;
  }

  async loadBundles() {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/bundles/?language=pt-BR')
      .toPromise();
    const bundles = requisicao.data;
    this.bundles = bundles;
    return requisicao.data
  }
  loadAgents = async () => {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/agents/?isPlayableCharacter=true&language=pt-BR')
      .toPromise();
    const agents = requisicao.data;
    this.agents = agents;
    return requisicao.data
  }
  async loadSkins() {
    const requisicao = await this.http
      .get<any>('https://valorant-api.com/v1/weapons/skins/?language=pt-BR')
      .toPromise();
    const skins = requisicao.data;
    this.skins = skins;
    console.log(skins)
  }

  loadTest() {
    return this.http.get('https://valorant-api.com/v1/agents/?isPlayableCharacter=true&language=pt-BR')
  }
}
