import { Component } from '@angular/core';
import { Character } from '../Model/Character';
import { RicktyService } from '../services/rickty.service';




@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css']
})
export class CharacterListComponent {


  constructor(public ricktyService: RicktyService){}
  
  page:number = 1;
  characters: Character[] = [];
  private charactersReserve: any;

  

   ngOnInit() {

    this.getAllCharacters();
    
  }
  getAllCharacters(){
    this.ricktyService.getAllCharacters().subscribe(characters => {
      this.characters = characters;
      this.charactersReserve = characters;
    });
  }
  onClickSearch(event:any){
    this.page = 1;
  }

  search(event :Event){
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const filter = this.charactersReserve.filter((character) =>
    character.name?.toLocaleLowerCase().includes(value))
    this.characters = filter;
    console.log(filter)
};

}



