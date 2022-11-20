import { Component, OnInit } from '@angular/core';
import { CharactersApiService } from '../services/characters-api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css']
})

export class SeriesComponent implements OnInit {

  title = 'Series';
  POSTS: any;
  page: number = 1;
  count: number = 0;
  tableSize: number = 5;

  constructor(private characterSvc: CharactersApiService) { }

  allCharacters: Observable<any>;

  ngOnInit() {
    this.getCharacters();
    this.fetchPosts();
  }

  getCharacters(){
    this.allCharacters = this.characterSvc.getAllCharacters();
  }


  fetchPosts(): void {
    this.characterSvc.getAllCharacters()
    .subscribe(
      (response) => {
        this.POSTS = response;
        console.log(response);
      },
      (error) => {
        console.log(error);
      });
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.fetchPosts();
  }
  
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchPosts();
  }
}
