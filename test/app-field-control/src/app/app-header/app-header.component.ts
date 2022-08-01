import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import { AppListCardComponent } from '../app-list-card/app-list-card.component';


const apikey = "ef5c950a084aa5c86369bfd7196923a8";
const hash = "7d5559b8a965629c6f1b2d0cddb6ff4e";
const ts = "1";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],

})
export class AppHeaderComponent implements OnInit {

  searchCharactersCtrl = new FormControl();
  filteredCharacters: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedCharacter: any = "";


  constructor(
    private http: HttpClient,
    private appListCardComponent: AppListCardComponent
  ) { }

  onSelected() {
    this.appListCardComponent.retrieveCharacters(this.selectedCharacter.name)
  }

  onEnter(event: any){
    this.appListCardComponent.retrieveCharacters(event.target.value);
    this.clearSelection();
    console.log()
  }

  displayWith(value: any) {
    return value?.Title;
  }

  clearSelection() {
    this.selectedCharacter = "";
    this.selectedCharacter = [];
  }

  ngOnInit() {
    this.searchCharactersCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredCharacters = [];
          this.isLoading = true;
        }),
        switchMap(value => this.http.get('http://gateway.marvel.com/v1/public/characters?nameStartsWith=' + value + '&apikey=' + apikey + '&hash=' + hash + '&ts=' + ts)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((data: any) => {
        console.log(data)
        if (data == undefined) {
          this.errorMsg = data['Error'];
          this.filteredCharacters = [];
        } else {
          this.errorMsg = "";
          this.filteredCharacters = data.data.results;
        }
      });
  }

}
