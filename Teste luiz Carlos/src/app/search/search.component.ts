import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Output() search = new EventEmitter<string>()

  login = "";

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(event: any) {
    event.preventDefault()
    this.search.emit(this.login)
  }

  onInput(value: string) {
    this.login = value
  }

}
