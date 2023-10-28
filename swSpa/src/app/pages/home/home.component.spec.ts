import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      imports: [HttpClientModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with pageNumber equals 1', () => {
    expect(component.pageNumber).toEqual(1);
  });

  it('should initialize peoples as a empty array', () => {
    expect(component.peoples).toEqual([]);
  });

  it("should initialize shouldHideLoad as false", () => {
    expect(component.shouldHideLoad).toBeFalse();
  })

  it('should initialize showWarning as false', () => {
    expect(component.showWarning).toBeFalse();
  })

  it('should render the app-nav-bar component', () => {
    const navBarComponent  = fixture.debugElement.query(By.css('app-nav-bar'));

    expect(navBarComponent).toBeTruthy();
  });

  it('should render the mat-progress-bar when shouldHideLoad is false', () => {
    component.shouldHideLoad = false;
    fixture.detectChanges();

    const progressBarElement = fixture.debugElement.query(By.css('mat-progress-bar'));

    expect(progressBarElement).toBeTruthy();
  });

  it('should not render the mat-progress-bar when shouldHideLoad is true', () => {
    component.shouldHideLoad = true;
    fixture.detectChanges();

    const progressBarElement = fixture.debugElement.query(By.css('mat-progress-bar'));

    expect(progressBarElement).toBeFalsy();
  });

  it('should render the app-card component for each people', () => {
    component.peoples = [{"name": "Luke Skywalker", 
    "height": "172", 
    "mass": "77", 
    "hair_color": "blond", 
    "skin_color": "fair", 
    "eye_color": "blue", 
    "birth_year": "19BBY", 
    "gender": "male", 
    "homeworld": "https://swapi.dev/api/planets/1/", 
    "films": [
        "https://swapi.dev/api/films/1/", 
        "https://swapi.dev/api/films/2/", 
        "https://swapi.dev/api/films/3/", 
        "https://swapi.dev/api/films/6/"
    ], 
    "species": [], 
    "vehicles": [
        "https://swapi.dev/api/vehicles/14/", 
        "https://swapi.dev/api/vehicles/30/"
    ], 
    "starships": [
        "https://swapi.dev/api/starships/12/", 
        "https://swapi.dev/api/starships/22/"
    ], 
    "created": "2014-12-09T13:50:51.644000Z", 
    "edited": "2014-12-20T21:17:56.891000Z", 
    "url": "https://swapi.dev/api/people/1/"}]
    
    fixture.detectChanges();

    const cardElement = fixture.debugElement.queryAll(By.css('app-card'));
    expect(cardElement.length).toBe(component.peoples.length);
  });

  it('should call the doSearch method when search text is emitted', () => {
    const searchText = 'test';
    spyOn(component, 'doSearch');
    component.receiveSearchText(searchText);
    expect(component.doSearch).toHaveBeenCalledWith(searchText);
  });

  it('should call the loadMore method when "More..." is clicked', () => {
    component.shouldHideLoad = true; // 
    fixture.detectChanges();
  
    const moreButton = fixture.debugElement.query(By.css('.load-more-button'));
    spyOn(component, 'loadMore');
  
    moreButton.triggerEventHandler('click', null);
    expect(component.loadMore).toHaveBeenCalled();
  });
});
