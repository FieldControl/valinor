import { Component, OnInit } from '@angular/core';
import { PokeApiService } from '../../service/poke-api.service';

@Component({
  selector: 'poke-list',
  templateUrl: './poke-list.component.html',
  styleUrls: ['./poke-list.component.scss', './pagination-controls.scss']
})
export class PokeListComponent implements OnInit {
  setAllPokemons: any;
  public getAllPokemons: any;
  public apiError: boolean = false;
  public page: number = 1;

  constructor(private pokeApiService: PokeApiService) { }

  ngOnInit() {
    this.pokeApiService.apiListAllPokemons.subscribe(
      res => {
        this.setAllPokemons = res.results;
        this.getAllPokemons = this.setAllPokemons;
        // Reset the page to 1 when the data is loaded
        this.page = 1;
      },
      error => {
        this.apiError = true;
      }
    );
  }


  public getSearch(value: string) {
    if (value.trim() === '') {
      // If the search value is empty, reset to the original data
      this.getAllPokemons = this.setAllPokemons;
    } else {
      const filter = this.setAllPokemons.filter((res: any) => {
        return !res.name.indexOf(value.toLowerCase());
      });
      this.getAllPokemons = filter;
    }
    // Reset the page to 1 when performing a search or clearing the search
    this.page = 1;
  }

}
