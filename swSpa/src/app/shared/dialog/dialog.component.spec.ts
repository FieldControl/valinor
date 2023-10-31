import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComponent } from './dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogComponent ],
      imports: [ MatDialogModule, HttpClientModule ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {title: 'test', films: []}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
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
    component.films = [{
      "title": "A New Hope", 
      "episode_id": 4, 
      "opening_crawl": "test", 
      "director": "George Lucas", 
      "producer": "Gary Kurtz, Rick McCallum", 
      "release_date": "1977-05-25", 
      "characters": [
          "https://swapi.dev/api/people/1/", 
          "https://swapi.dev/api/people/2/", 
          "https://swapi.dev/api/people/3/", 
          "https://swapi.dev/api/people/4/", 
          "https://swapi.dev/api/people/5/", 
          "https://swapi.dev/api/people/6/", 
          "https://swapi.dev/api/people/7/", 
          "https://swapi.dev/api/people/8/", 
          "https://swapi.dev/api/people/9/", 
          "https://swapi.dev/api/people/10/", 
          "https://swapi.dev/api/people/12/", 
          "https://swapi.dev/api/people/13/", 
          "https://swapi.dev/api/people/14/", 
          "https://swapi.dev/api/people/15/", 
          "https://swapi.dev/api/people/16/", 
          "https://swapi.dev/api/people/18/", 
          "https://swapi.dev/api/people/19/", 
          "https://swapi.dev/api/people/81/"
      ], 
      "planets": [
          "https://swapi.dev/api/planets/1/", 
          "https://swapi.dev/api/planets/2/", 
          "https://swapi.dev/api/planets/3/"
      ], 
      "starships": [
          "https://swapi.dev/api/starships/2/", 
          "https://swapi.dev/api/starships/3/", 
          "https://swapi.dev/api/starships/5/", 
          "https://swapi.dev/api/starships/9/", 
          "https://swapi.dev/api/starships/10/", 
          "https://swapi.dev/api/starships/11/", 
          "https://swapi.dev/api/starships/12/", 
          "https://swapi.dev/api/starships/13/"
      ], 
      "vehicles": [
          "https://swapi.dev/api/vehicles/4/", 
          "https://swapi.dev/api/vehicles/6/", 
          "https://swapi.dev/api/vehicles/7/", 
          "https://swapi.dev/api/vehicles/8/"
      ], 
      "species": [
          "https://swapi.dev/api/species/1/", 
          "https://swapi.dev/api/species/2/", 
          "https://swapi.dev/api/species/3/", 
          "https://swapi.dev/api/species/4/", 
          "https://swapi.dev/api/species/5/"
      ], 
      "created": "2014-12-10T14:23:31.880000Z", 
      "edited": "2014-12-20T19:49:45.256000Z", 
      "url": "https://swapi.dev/api/films/1/"
  }];

    fixture.detectChanges();

    const filmeElement = fixture.debugElement.queryAll(By.css('.film-title'));
    expect(filmeElement.length).toBe(component.films.length);

  });

});
