import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { StarWarsService } from 'src/app/core/star-wars.service';
import { of, throwError } from 'rxjs';
import { FooterComponent } from 'src/app/shared/footer/footer.component';
import { MOCK_API_RES, MOCK_NEW_PAGE, PEOPLES_RES } from 'src/app/core/peoples.mock';


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
    component.peoples = PEOPLES_RES.results;
    
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
    
    const mockApiRes = MOCK_API_RES;
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

  it('should list peoples from service', () => {
    spyOn(_swService, 'getPeople').and.returnValue(of(MOCK_API_RES));

    component.ngOnInit();
    fixture.detectChanges();

    expect(_swService.getPeople).toHaveBeenCalledWith();
    expect(component.peoples.length).toEqual(MOCK_API_RES.results.length);
    expect(component.shouldHideLoad).toBeTrue();
  });

  it('should search people via api when doSearch receives results when gets called', () => {
    
    spyOn(_swService, 'searchPeople').and.returnValue(of(PEOPLES_RES));
    let query = 'R2-D2'

    fixture.detectChanges()

    component.doSearch(query);
   
    expect(component.peoples).toEqual(PEOPLES_RES.results);
    expect(component.textSearched).toEqual(query);
    expect(component.shouldHideLoad).toBeTrue();

  });

  it('should handle a non-existing search', () => {

    spyOn(_swService, 'searchPeople').and.returnValue(of({count: 0, next: 'null', previous: 'null', results: []}))
    let query = 'test'
    component.textSearched = query;

    fixture.detectChanges()

    component.doSearch(query);
   
    expect(component.peoples).toEqual([]);
    expect(component.textSearched).toEqual(query);
    expect(component.shouldHideLoad).toBeTrue();
    expect(component.showWarning).toBeTrue();
  });

  it('should getPagination and concat the people array', () => {    
    component.peoples = MOCK_API_RES.results;
    component.pageNumber = 2;
    component.shouldHideLoad = false;
    
    spyOn(_swService, 'getPagination').and.returnValue(of(MOCK_NEW_PAGE));


    component.loadMore();

    expect(component.peoples).toEqual([...MOCK_API_RES.results, ...MOCK_NEW_PAGE.results]);
    expect(component.shouldHideLoad).toBeTrue();

  });

  it('should handle get people error', () => {
    const mockedError = new Error('Error during the search of the element');
  
    spyOn(console, 'error');
    
    spyOn(_swService, 'getPeople').and.returnValue(throwError ( () => {
      const error = new Error('Error during the search of the element');
      return error;
    }));
  
    component.doSearch('');
  
    expect(console.error).toHaveBeenCalledWith('Error during the search of the element', mockedError);
  });

  it('should handle pagination error', () => {
    const mockedError = new Error('Error when getting page content');
    component.pageNumber = 1;
    component.shouldHideLoad = true;

    spyOn(console, 'error');

    spyOn(_swService, 'getPagination').and.returnValue(throwError ( () => {
      const error = new Error('Error when getting page content');
      return error;
    }));

    component.loadMore();

    expect(console.error).toHaveBeenCalledWith('Error when getting page content', mockedError);
  });
  
});
