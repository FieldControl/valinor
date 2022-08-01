import { Injectable } from '@angular/core';
import { Character } from 'src/model/Character';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  public characters: Character[] = [];
  apikey = "ef5c950a084aa5c86369bfd7196923a8";
  hash = "7d5559b8a965629c6f1b2d0cddb6ff4e";
  ts = "1";


  constructor( private httpClient: HttpClient,) {}

  showTasks(searchText: string = '') {
    let urlSearchText = searchText != '' ? 'nameStartsWith=' + searchText + '&' : '';
    this.characters.length = 0;
    let characterUrl = 'http://gateway.marvel.com/v1/public/characters?' + urlSearchText + 'apikey=' + this.apikey + '&hash=' + this.hash + '&ts=' + this.ts;
    this.httpClient.get<any>(characterUrl).subscribe(res => {
      for (let i = 0; i < res.data.results.length; i++) {
        this.characters.push({
          id: res.data.results[i].id,
          name: res.data.results[i].name,
          description: res.data.results[i].description,
          stories: res.data.results[i].stories.available,
          image: res.data.results[i].thumbnail.path + '.' + res.data.results[i].thumbnail.extension,
        })
      }
    });
  }


}




