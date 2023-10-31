import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { StarWarsService } from 'src/app/core/star-wars.service';
import { ResultWapper } from 'src/app/core/common';
import { People } from 'src/app/models/people.model';
import { EmptyError, catchError, of, throwError } from 'rxjs';
import { FooterComponent } from 'src/app/shared/footer/footer.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let _swService: StarWarsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeComponent, FooterComponent ],
      imports: [ HttpClientModule ],
      providers: [ StarWarsService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    _swService = TestBed.inject(StarWarsService);
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
  });

  it('should initialize showWarning as false', () => {
    expect(component.showWarning).toBeFalse();
  });

  it("should initialize textSearched variable empty", () => {
    expect(component.textSearched).toEqual('');
  });

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

  it('should get new page via api when more is clicked', () => {
    const mockApiRes: ResultWapper<People> = {
      "count": 82,
      "next": "https://swapi.dev/api/people/?page=2",
      "previous": '',
      "results": [
        {
          "name": "Luke Skywalker",
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
          "url": "https://swapi.dev/api/people/1/"
        },
        {
          "name": "C-3PO",
          "height": "167",
          "mass": "75",
          "hair_color": "n/a",
          "skin_color": "gold",
          "eye_color": "yellow",
          "birth_year": "112BBY",
          "gender": "n/a",
          "homeworld": "https://swapi.dev/api/planets/1/",
          "films": [
            "https://swapi.dev/api/films/1/",
            "https://swapi.dev/api/films/2/",
            "https://swapi.dev/api/films/3/",
            "https://swapi.dev/api/films/4/",
            "https://swapi.dev/api/films/5/",
            "https://swapi.dev/api/films/6/"
          ],
          "species": [
            "https://swapi.dev/api/species/2/"
          ],
          "vehicles": [],
          "starships": [],
          "created": "2014-12-10T15:10:51.357000Z",
          "edited": "2014-12-20T21:17:50.309000Z",
          "url": "https://swapi.dev/api/people/2/"
        },
        {
          "name": "R2-D2",
          "height": "96",
          "mass": "32",
          "hair_color": "n/a",
          "skin_color": "white, blue",
          "eye_color": "red",
          "birth_year": "33BBY",
          "gender": "n/a",
          "homeworld": "https://swapi.dev/api/planets/8/",
          "films": [
            "https://swapi.dev/api/films/1/",
            "https://swapi.dev/api/films/2/",
            "https://swapi.dev/api/films/3/",
            "https://swapi.dev/api/films/4/",
            "https://swapi.dev/api/films/5/",
            "https://swapi.dev/api/films/6/"
          ],
          "species": [
            "https://swapi.dev/api/species/2/"
          ],
          "vehicles": [],
          "starships": [],
          "created": "2014-12-10T15:11:50.376000Z",
          "edited": "2014-12-20T21:17:50.311000Z",
          "url": "https://swapi.dev/api/people/3/"
        },
        {
          "name": "Darth Vader",
          "height": "202",
          "mass": "136",
          "hair_color": "none",
          "skin_color": "white",
          "eye_color": "yellow",
          "birth_year": "41.9BBY",
          "gender": "male",
          "homeworld": "https://swapi.dev/api/planets/1/",
          "films": [
            "https://swapi.dev/api/films/1/",
            "https://swapi.dev/api/films/2/",
            "https://swapi.dev/api/films/3/",
            "https://swapi.dev/api/films/6/"
          ],
          "species": [],
          "vehicles": [],
          "starships": [
            "https://swapi.dev/api/starships/13/"
          ],
          "created": "2014-12-10T15:18:20.704000Z",
          "edited": "2014-12-20T21:17:50.313000Z",
          "url": "https://swapi.dev/api/people/4/"
        },
        {
          "name": "Leia Organa",
          "height": "150",
          "mass": "49",
          "hair_color": "brown",
          "skin_color": "light",
          "eye_color": "brown",
          "birth_year": "19BBY",
          "gender": "female",
          "homeworld": "https://swapi.dev/api/planets/2/",
          "films": [
            "https://swapi.dev/api/films/1/",
            "https://swapi.dev/api/films/2/",
            "https://swapi.dev/api/films/3/",
            "https://swapi.dev/api/films/6/"
          ],
          "species": [],
          "vehicles": [
            "https://swapi.dev/api/vehicles/30/"
          ],
          "starships": [],
          "created": "2014-12-10T15:20:09.791000Z",
          "edited": "2014-12-20T21:17:50.315000Z",
          "url": "https://swapi.dev/api/people/5/"
        },
        {
          "name": "Owen Lars",
          "height": "178",
          "mass": "120",
          "hair_color": "brown, grey",
          "skin_color": "light",
          "eye_color": "blue",
          "birth_year": "52BBY",
          "gender": "male",
          "homeworld": "https://swapi.dev/api/planets/1/",
          "films": [
            "https://swapi.dev/api/films/1/",
            "https://swapi.dev/api/films/5/",
            "https://swapi.dev/api/films/6/"
          ],
          "species": [],
          "vehicles": [],
          "starships": [],
          "created": "2014-12-10T15:52:14.024000Z",
          "edited": "2014-12-20T21:17:50.317000Z",
          "url": "https://swapi.dev/api/people/6/"
        },
        {
          "name": "Beru Whitesun lars",
          "height": "165",
          "mass": "75",
          "hair_color": "brown",
          "skin_color": "light",
          "eye_color": "blue",
          "birth_year": "47BBY",
          "gender": "female",
          "homeworld": "https://swapi.dev/api/planets/1/",
          "films": [
            "https://swapi.dev/api/films/1/",
            "https://swapi.dev/api/films/5/",
            "https://swapi.dev/api/films/6/"
          ],
          "species": [],
          "vehicles": [],
          "starships": [],
          "created": "2014-12-10T15:53:41.121000Z",
          "edited": "2014-12-20T21:17:50.319000Z",
          "url": "https://swapi.dev/api/people/7/"
        },
        {
          "name": "R5-D4",
          "height": "97",
          "mass": "32",
          "hair_color": "n/a",
          "skin_color": "white, red",
          "eye_color": "red",
          "birth_year": "unknown",
          "gender": "n/a",
          "homeworld": "https://swapi.dev/api/planets/1/",
          "films": [
            "https://swapi.dev/api/films/1/"
          ],
          "species": [
            "https://swapi.dev/api/species/2/"
          ],
          "vehicles": [],
          "starships": [],
          "created": "2014-12-10T15:57:50.959000Z",
          "edited": "2014-12-20T21:17:50.321000Z",
          "url": "https://swapi.dev/api/people/8/"
        },
        {
          "name": "Biggs Darklighter",
          "height": "183",
          "mass": "84",
          "hair_color": "black",
          "skin_color": "light",
          "eye_color": "brown",
          "birth_year": "24BBY",
          "gender": "male",
          "homeworld": "https://swapi.dev/api/planets/1/",
          "films": [
            "https://swapi.dev/api/films/1/"
          ],
          "species": [],
          "vehicles": [],
          "starships": [
            "https://swapi.dev/api/starships/12/"
          ],
          "created": "2014-12-10T15:59:50.509000Z",
          "edited": "2014-12-20T21:17:50.323000Z",
          "url": "https://swapi.dev/api/people/9/"
        },
        {
          "name": "Obi-Wan Kenobi",
          "height": "182",
          "mass": "77",
          "hair_color": "auburn, white",
          "skin_color": "fair",
          "eye_color": "blue-gray",
          "birth_year": "57BBY",
          "gender": "male",
          "homeworld": "https://swapi.dev/api/planets/20/",
          "films": [
            "https://swapi.dev/api/films/1/",
            "https://swapi.dev/api/films/2/",
            "https://swapi.dev/api/films/3/",
            "https://swapi.dev/api/films/4/",
            "https://swapi.dev/api/films/5/",
            "https://swapi.dev/api/films/6/"
          ],
          "species": [],
          "vehicles": [
            "https://swapi.dev/api/vehicles/38/"
          ],
          "starships": [
            "https://swapi.dev/api/starships/48/",
            "https://swapi.dev/api/starships/59/",
            "https://swapi.dev/api/starships/64/",
            "https://swapi.dev/api/starships/65/",
            "https://swapi.dev/api/starships/74/"
          ],
          "created": "2014-12-10T16:16:29.192000Z",
          "edited": "2014-12-20T21:17:50.325000Z",
          "url": "https://swapi.dev/api/people/10/"
        }
      ]
    };
    component.pageNumber = 1;

    component.shouldHideLoad = true;
    fixture.detectChanges();

    const moreButton = fixture.debugElement.query(By.css('.load-more-button'));

    moreButton.triggerEventHandler('click', null);

    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    httpClientSpy.get.and.returnValue(of(mockApiRes));

    const swService = new StarWarsService(httpClientSpy);

    swService.getPagination(1).subscribe((res) => {
      expect(res).toEqual(mockApiRes)
    });
  });

  it('should handle loadMore error', () => {
    const mockError = 'Error when getting page content';

    component.pageNumber = 1;

    component.shouldHideLoad = true;
    fixture.detectChanges();

    const moreButton = fixture.debugElement.query(By.css('.load-more-button'));

    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    moreButton.triggerEventHandler('click', null);

    httpClientSpy.error.and.returnValue(of(mockError));

    const swService = new StarWarsService(httpClientSpy);

    



  })

  it('should increment page number after getPagination is called', () => {
    component.pageNumber = 1;

    component.loadMore();

    expect(component.pageNumber).toBe(2);
  });

  it('shoud change showWarning to false after receiveSearchText is calle', () => {
    const searchText = 'test'

    component.showWarning = true;
    
    component.receiveSearchText(searchText);

    expect(component.showWarning).toBeFalse();
  });

  it('should call doSearch() method when receiveSearchText() is called', () => {
    const searchText = 'test';

    spyOn(component, 'doSearch')

    component.receiveSearchText(searchText);

    expect(component.doSearch).toHaveBeenCalledWith(searchText);
  });
});
