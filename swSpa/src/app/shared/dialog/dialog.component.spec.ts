import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComponent } from './dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { MOCKED_FILMS } from 'src/app/core/movies.mock';
import { MoviesService } from 'src/app/core/movies.service';
import { _supportsShadowDom } from '@angular/cdk/platform';
import { of, throwError } from 'rxjs';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let _moviesService: MoviesService; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogComponent ],
      imports: [ MatDialogModule, HttpClientModule ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {title: 'test', films: []}},
        MoviesService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    _moviesService = TestBed.inject(MoviesService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize shouldHideLoad variable as false', () => {
    expect(component.shouldHideLoad).toBeFalse();
  });

  it('should not render the subtitle when the shouldHideLoad is false', () => {
    component.shouldHideLoad = false;
    fixture.detectChanges();

    const componentSubtitle = fixture.debugElement.query(By.css('.appearences-subtitle'));

    expect(componentSubtitle).toBeFalsy();
  });

  it('should render the subtitle if shouldHideLoad is true', () => {
    component.shouldHideLoad = true;
    fixture.detectChanges();

    const progressSpiner = fixture.debugElement.query(By.css('.appearences-subtitle'));

    expect(progressSpiner).toBeTruthy();
  });

  it('should render the progress spinner when shoulddHideLoad is false', () => {
    
    component.shouldHideLoad = false;

    fixture.detectChanges();

    const progressSpiner = fixture.debugElement.query(By.css('mat-progress-spinner'));

    expect(progressSpiner).toBeTruthy();
  });

  it('should not render the progress spinner whe should hide load is true', () => {
    component.shouldHideLoad = true;

    fixture.detectChanges();

    const progressSpiner = fixture.debugElement.query(By.css('mat-progress-spinner'));

    expect(progressSpiner).toBeFalsy();
  });

  it('should render the film list when shouldHideLoad is true and films[] has values', () => {
    component.shouldHideLoad = true;
    component.films = MOCKED_FILMS

    fixture.detectChanges();

    const filmeElement = fixture.debugElement.queryAll(By.css('.film-title'));
    expect(filmeElement.length).toBe(component.films.length);

  });

  it('should get movies onInit', () => {
    
    spyOn(_moviesService, 'getMultiFilms').and.returnValue(of(MOCKED_FILMS));
    component.data.films = ['url1'];

    component.ngOnInit();
    fixture.detectChanges();

    expect(_moviesService.getMultiFilms).toHaveBeenCalledWith(component.data.films);

    expect(component.films.length).toEqual(MOCKED_FILMS.length);
    expect(component.shouldHideLoad).toBeTrue();
  
  });

  it('should handle films error', () => {
    const mockedError = new Error('Error during the search of the films');
    component.data.films = ['url1'];
    spyOn(console, 'error');

    spyOn(_moviesService, 'getMultiFilms').and.returnValue(throwError ( () => {
      const error = new Error('Error during the search of the films');
      return error;
    }));

    component.ngOnInit();
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith('Error during the search of the films', mockedError);
  });

});
