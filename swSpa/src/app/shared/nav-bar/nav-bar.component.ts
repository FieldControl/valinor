import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StarWarsService } from 'src/app/core/star-wars.service';
import { People } from 'src/app/models/people.model';


@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  @Output() searchText = new EventEmitter<string>();
  
  constructor(private _swService: StarWarsService) { }

  ngOnInit(): void {
  }

  searchedText(text: string) {
    this.searchText.emit(text);
  }

}
