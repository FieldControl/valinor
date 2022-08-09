import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';

import { PokeAPIService } from 'src/app/service/poke-api.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  private urlPokemon: string = 'https://pokeapi.co/api/v2/pokemon'

  public pokemon: any
  public isLoading = false
  public apiError = false

  constructor(
    private activatedRouter: ActivatedRoute,
    private pokeApiService: PokeAPIService
  ) { }

  ngOnInit(): void {
    this.getPokemon;
  }

  get getPokemon() {
    const id = this.activatedRouter.snapshot.params['id']
    const pokemon = this.pokeApiService.apiGetPokemons(`${this.urlPokemon}/${id}`)

    return forkJoin([pokemon]).subscribe(
      response => {
        this.pokemon = response
        this.isLoading = true
      },
      error => {
        this.apiError = true
      }
    )

  }
}
