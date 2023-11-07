import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { PokeAPIService } from '../services/poke-api.service';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css']
})
export class PokedexComponent implements OnInit {

  @Output() informacaoEnviada = new EventEmitter<string>();
  public pokemons: any = [];
  public proximaPagina: string = '';
  public pokemonPesquisado: string = '';
  public pokemonNaoEncontrado: boolean = false;
  public dadosDoPokemon: any = [];

  constructor(
    private servicePokeAPI: PokeAPIService,
  ) { }

  ngOnInit(): void {
    this.listarPokemons()
  }

  listarPokemons() {
    this.servicePokeAPI.listarPokemonsPaginado().subscribe((pokemons: any) => {
      this.pokemons = [];
      this.pokemonNaoEncontrado = false;
      this.buscarDadosCompletosDosPokemons(pokemons);
    })
  }

  exibirMaisPokemons() {
    this.servicePokeAPI.chamarRequestGET(this.proximaPagina).subscribe((pokemons: any) => {
      this.buscarDadosCompletosDosPokemons(pokemons);
    })
  }

  buscarDadosCompletosDosPokemons(pokemons: any) {
    pokemons.results.forEach((pokemon: any) => {
      this.servicePokeAPI.chamarRequestGET(pokemon.url).subscribe((dadosCompletosDoPokemon: any) => {
        pokemon.dadosCompletos = dadosCompletosDoPokemon;
      })
    });
    this.pokemons = this.pokemons.concat(pokemons.results);
    this.proximaPagina = pokemons.next;
  }

  buscarPokemon() {
    if (this.pokemonPesquisado == '') {
      this.listarPokemons();
    } else {
      this.servicePokeAPI.listarPokemonPorIdOuNome(this.pokemonPesquisado).subscribe((pokemonFiltrado: any) => {
        this.pokemonNaoEncontrado = false;
        this.pokemons = [{
          'name': this.pokemonPesquisado,
          'dadosCompletos': pokemonFiltrado
        }]
      }, erro => {
        this.pokemonNaoEncontrado = true;
      })
    }
  }
}
