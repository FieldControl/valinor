import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output() searchTermChanges = new EventEmitter();

  filteredCharacters: any;
  searchTerm = new FormControl<string>('');

  ngOnInit(): void {
    this.searchTerm.valueChanges.subscribe((value) => {
      this.searchTermChanges.emit(value);
    });
  }
}
