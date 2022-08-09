import { Component, OnInit } from '@angular/core';

import { PokeAPIService } from 'src/app/service/poke-api.service';

@Component({
  selector: 'app-poke-list',
  templateUrl: './poke-list.component.html',
  styleUrls: ['./poke-list.component.scss']
})
export class PokeListComponent implements OnInit {

  private setAllPokemons: any;
  public getAllPokemons: any;

  constructor(
    private pokeApiService: PokeAPIService
  ) { }

  ngOnInit(): void {
    this.pokeApiService.apiListAllPokemons.subscribe(response => {
      this.setAllPokemons = response.results;
      this.getAllPokemons = this.setAllPokemons;
    })
  }

  public getSearch(value: string) {

    const filter = this.setAllPokemons.filter((response: any) => {
      return !response.name.indexOf(value.toLowerCase())
    })

    this.getAllPokemons = filter;
  }
}
