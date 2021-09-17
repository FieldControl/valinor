import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  private query = '';
  searchForm = new FormControl('');

  @Output() search = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  //Função que realiza a pesquisa através da api, disparada pelo botão no componente html
  startSearch() {
    this.query = this.searchForm.value;
    this.search.emit(this.query);
  }
}
