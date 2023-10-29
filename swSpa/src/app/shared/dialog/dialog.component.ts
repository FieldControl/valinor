import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Observable, catchError } from 'rxjs';
import { MoviesService } from 'src/app/core/movies.service';
import { Film } from 'src/app/models/film.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {

  films: Film[] = []
  shouldHideLoad: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {title: string, films: string[]}, private _filmsService: MoviesService) {
    
  }

  

  ngOnInit(): void {
    console.log(this.data);
    if(this.data.films.length > 0) {
      this._filmsService.getMultiFilms(this.data.films).pipe(
        catchError(error => {
          console.error('Error during the search of the films', error);
          return [];
        })
      ).subscribe((res: any) => {
        this.films = res;
        this.shouldHideLoad = true;
      }) 
    }
  }
}


