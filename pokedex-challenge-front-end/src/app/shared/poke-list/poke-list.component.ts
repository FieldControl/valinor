import { Component, OnInit } from '@angular/core';

import { PokeAPIService } from 'src/app/service/poke-api.service';

@Component({
  selector: 'app-poke-list',
  templateUrl: './poke-list.component.html',
  styleUrls: ['./poke-list.component.scss']
})
export class PokeListComponent implements OnInit {

  public getAllPokemons: any;

  constructor(
    private pokeApiService: PokeAPIService
  ) { }

  ngOnInit(): void {
    this.pokeApiService.apiListAllPokemons.subscribe(response => {
      this.getAllPokemons = response.results;
      console.log(this.getAllPokemons)
    }
    )
  }
}
