import { ChangeDetectorRef, Component, OnInit } from '@angular/core';


import { Character } from 'src/model/Character';
import { CharacterService } from 'src/services/character.service';

@Component({
  selector: 'app-list-card',
  templateUrl: './app-list-card.component.html',
  styleUrls: ['./app-list-card.component.css'],
})
export class AppListCardComponent implements OnInit {

  public characters: Character[] = [];
  page = 1;
  count = 0;
  pageSize = 3;
  pageSizes = [3, 5, 10];

  constructor(
    private characterService: CharacterService,
    private cdr: ChangeDetectorRef,
   ) {

   }

  ngOnInit() {
    this.characterService.showTasks()
    this.characters = this.characterService.characters
    this.cdr.detectChanges();
  }


  retrieveCharacters(searchText: string = '') {
    this.characterService.showTasks(searchText)
    this.characters = this.characterService.characters
    this.cdr.detectChanges();
  }

  handlePageSizeChange(event: any): void {
    console.log('oi')
    this.pageSize = event.target.value;
    this.page = 1;
    this.retrieveCharacters();
  }

  getRequestParams(searchTitle: string, page: number, pageSize: number): any {
    let params: any = {};
    if (searchTitle) {
      params[`title`] = searchTitle;
    }
    if (page) {
      params[`page`] = page - 1;
    }
    if (pageSize) {
      params[`size`] = pageSize;
    }
    return params;
  }

  handlePageChange(event: number): void {
    console.log('oi')
    this.page = event;
    this.retrieveCharacters();
  }



}

