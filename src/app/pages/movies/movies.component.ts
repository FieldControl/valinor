import { Component } from '@angular/core';
import { MovieServiceService } from 'src/app/services/movie-service.service';
@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
})
export class MoviesComponent {
  movies: any;
  currentPage: number = 1;
  totalPages?: number;

  constructor(private movieService: MovieServiceService) {}

  ngOnInit() {
    this.getMovies(this.currentPage);
  }

  getMovies = (page: number, name?: string) => {
    this.movieService.getMovies(page, name).subscribe((response) => {
      this.movies = response.docs;
      this.totalPages = response.pages;
    });
  };

  handleCurrentPage = (page: number) => {
    this.currentPage = page;
    this.getMovies(page);
  };

  handleMovieTitle = (name: string) => {
    this.getMovies(this.currentPage, name);
  };
}
