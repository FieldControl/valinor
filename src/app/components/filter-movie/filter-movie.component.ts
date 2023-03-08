import { Component, EventEmitter, Output } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-filter-movie',
  templateUrl: './filter-movie.component.html',
  styleUrls: ['./filter-movie.component.css']
})

export class FilterMovieComponent {
  faSearch = faSearch;
  name?: string

  @Output() movieTitle = new EventEmitter<string>()

  filterMovie = () => {
    this.movieTitle.emit(this.name)
  }

}
