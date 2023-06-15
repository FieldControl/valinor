import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarvelService } from './services/menu.page.marvel.service';
import { StarWarsService } from './services/menu.page.starwars.service';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.component.html',
  styleUrls: ['menu.page.component.scss'],
})
export class MenuPageComponent implements OnInit {
  marvelOn: boolean = false;
  starWarsOn: boolean = false;
  displayedRows: any[] = [];
  filteredRows: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  nextPageStarWars: string = '';
  previousPageStarWars: string = '';

  constructor(
    private router: Router,
    private marvelService: MarvelService,
    private starWarsService: StarWarsService
  ) {}

  ngOnInit(): void {
    if (this.router.url == '/menu/marvel') {
      this.marvelOn = true;
      this.listMarvelCharacters();
    } else if (this.router.url == '/menu/starwars') {
      this.starWarsOn = true;
      this.listStarWarsCharacters();
    }
  }

  listMarvelCharacters() {
    this.marvelService.getCharacters().subscribe((response) => {
      const characters = response.data.results;

      if (Array.isArray(characters)) {
        this.displayedRows = characters.map((character) => {
          return {
            Personagem: character.name,
            Descricao: character.description,
            Imagem:
              character.thumbnail.path + '.' + character.thumbnail.extension,
          };
        });

        this.filterRows(); // Chamada do método filterRows() para filtrar os personagens iniciais

        this.totalPages = Math.ceil(
          this.filteredRows.length / this.itemsPerPage
        );
      } else {
        // Lida com o caso em que 'characters' não é um array
      }
    });
  }

  filterRows(): void {
    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredRows = this.displayedRows.filter((row: any) => {
      const personagem = row.Personagem.toLowerCase();
      const descricao = row.Descricao.toLowerCase();

      return personagem.includes(searchTerm) || descricao.includes(searchTerm);
    });

    if (this.router.url === '/menu/marvel') {
      this.totalPages = Math.ceil(this.filteredRows.length / this.itemsPerPage);
      this.currentPage = 1;
    }
  }

  listStarWarsCharacters() {
    this.starWarsService.getCharacters().subscribe((response) => {
      console.log(response);
      const characters = response.results;
      console.log(characters);
      this.nextPageStarWars = response.next;
      this.totalPages = response.count;

      if (Array.isArray(characters)) {
        this.displayedRows = characters.map((character) => {
          return {
            Personagem: character.name,
            Descricao:
              ' height : ' +
              character.height +
              ' | ' +
              ' mass : ' +
              character.mass +
              ' | ' +
              ' hair_Color : ' +
              character.hair_color,
          };
        });

        this.filterRows(); // Chamada do método filterRows() para filtrar os personagens iniciais
      } else {
        // Lida com o caso em que 'characters' não é um array
      }
    });
  }

  previousPage(): void {
    if (this.router.url === '/menu/marvel') {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    } else if (this.router.url === '/menu/starwars') {
      this.starWarsService
        .getCharactersPreviousPage(this.previousPageStarWars)
        .subscribe(
          (response) => {
            if (this.currentPage > 1) {
              this.currentPage--;
              console.log(response);
              this.previousPageStarWars = response.previous;
              this.nextPage = response.next;
              const characters = response.results;
              console.log(characters);

              if (Array.isArray(characters)) {
                this.displayedRows = characters.map((character) => {
                  return {
                    Personagem: character.name,
                    Descricao:
                      ' height : ' +
                      character.height +
                      ' | ' +
                      ' mass : ' +
                      character.mass +
                      ' | ' +
                      ' hair_Color : ' +
                      character.hair_color,
                  };
                });

                console.log(this.displayedRows);

                this.filterRows(); // Chamada do método filterRows() para filtrar os personagens iniciais
              } else {
                // Lida com o caso em que 'characters' não é um array
              }
            }
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }
  nextPage(): void {
    if (this.router.url === '/menu/marvel') {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    } else if (this.router.url === '/menu/starwars') {
      this.starWarsService
        .getCharactersNextPage(this.nextPageStarWars)
        .subscribe(
          (response) => {
            this.currentPage++;
            console.log(response);
            this.previousPageStarWars = response.previous;
            this.nextPageStarWars = response.next;
            const characters = response.results;
            console.log(characters);

            if (Array.isArray(characters)) {
              this.displayedRows = characters.map((character) => {
                return {
                  Personagem: character.name,
                  Descricao:
                    ' height : ' +
                    character.height +
                    ' | ' +
                    ' mass : ' +
                    character.mass +
                    ' | ' +
                    ' hair_Color : ' +
                    character.hair_color,
                };
              });

              console.log(this.displayedRows);

              this.filterRows(); // Chamada do método filterRows() para filtrar os personagens iniciais
            } else {
              // Lida com o caso em que 'characters' não é um array
            }
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }
}
