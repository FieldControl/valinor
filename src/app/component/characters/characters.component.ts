import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { Observable } from 'rxjs';

import { CharactersApiService } from '../../shared/service/character.api.service';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css']
})
export class CharactersComponent implements OnInit {
  search = new FormControl('');

  //inicializar a paginação
  @ViewChild(MatPaginator, {static:false}) paginator: MatPaginator;
  page_size: number = 6;
  page_number: number = 1;

  //metodo para troca de páginas
  handlePage(e: PageEvent) {
    this.page_size = e.pageSize;
    this.page_number = e.pageIndex + 1;
  }

  constructor(private characterService: CharactersApiService) { }
  allcharacters: Observable<any>;

  ngOnInit(): void {

    //carregando os personagens
    this.getCharacters();

    //observando se search(pesquisa) houve alteração e chamando metodo de carregar personagens por pesquisa
    this.search.valueChanges.subscribe(val => {

        //caso apaguem o campo de pesquisa
        if(val == ''){
          this.getCharacters();
          this.paginator.firstPage();
        }else{
          //se pesquisa tem valor então carrega os personagens pesquisados
          this.getCharacter(val);
          this.paginator.firstPage();

        }
    })
  }

  //trazendo todos os personagens
  getCharacters(){
    this.allcharacters = this.characterService.getAllCharacters();
  }

  //trazendo os personagens de acordo com a pesquisa
  getCharacter(search: string){
    this.allcharacters = this.characterService.getCharacter(search);
  }
}
