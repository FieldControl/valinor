import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Data } from '@angular/router';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class apiService implements OnInit {
  bundles: any = [];
  agents: any = [];
  skins: any = [];
  
  bundlesUrl:string = 'https://valorant-api.com/v1/bundles/?language=pt-BR';
  agentsUrl: string = 'https://valorant-api.com/v1/agents/?isPlayableCharacter=true&language=pt-BR';
  skinsUrl:string = 'https://valorant-api.com/v1/weapons/skins/?language=pt-BR';
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
    const apiGet = this.http.get<any>(this.bundlesUrl)
    const req = await firstValueFrom(apiGet)
    this.bundles = req.data;
  }
  async loadAgents() {
    const apiGet = this.http.get<any>(this.agentsUrl)
    const req = await firstValueFrom(apiGet)
    this.agents = req.data;
  }
  async loadSkins() {
    const apiGet = this.http.get<any>(this.skinsUrl)
    const req = await firstValueFrom(apiGet)
    this.skins = req.data;
  }

}
