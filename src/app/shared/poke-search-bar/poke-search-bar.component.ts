import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-poke-search-bar',
  templateUrl: './poke-search-bar.component.html',
  styleUrls: ['./poke-search-bar.component.scss']
})
export class PokeSearchBarComponent implements OnInit {

  @Output() public emmitSearch: EventEmitter<string> = new EventEmitter

  constructor () {}

  ngOnInit(): void {

  }

  public search(value: string) {
    this.emmitSearch.emit(value)
  }
}
