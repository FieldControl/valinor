import { Component, OnInit } from '@angular/core';
import { CharactersApiService } from '../services/characters-api.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  title = 'Marvel Comics';

  constructor(private characterSvc: CharactersApiService) { }
  allCharacters: Observable<any>;
  ngOnInit() {
    this.getCharacters();
  }

  getCharacters(){
    this.allCharacters = this.characterSvc.getAllCharacters();
  }
}
