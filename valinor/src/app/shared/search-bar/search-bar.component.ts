import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, map, switchMap, take, tap } from 'rxjs';
import { GithubService } from 'src/app/services/github.service';
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  @Input() search!: string;
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() searchResult = new EventEmitter<any>();
  constructor(private gitService: GithubService) {}

  ngOnInit(): void {}

  onInputChange(event: Event) {
    this.searchTermChange.emit(this.search);
  }

  emitSearch() {
    this.searchResult.emit(this.search);
  }
}
