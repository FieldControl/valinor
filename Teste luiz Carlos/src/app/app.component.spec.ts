import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { AppComponent } from './app.component';
import { SearchService } from './search.service';

describe('AppComponent', () => {

  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [SearchService]
    }).compileComponents();
    service = TestBed.inject(SearchService)
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should search', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const login = 'login'
    spyOn(service, 'search');
    app.onSearch(login)
    expect(service.search).toHaveBeenCalledWith(login);
  })

  it('should page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const i = 3
    spyOn(service, 'goToPage');
    app.onPage(i)
    expect(service.goToPage).toHaveBeenCalledWith(i);
  })

  it('should sort', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const sortDirection = { column: 'login', direction: true }
    spyOn(service, 'sort');
    app.onSort(sortDirection)
    expect(service.sort).toHaveBeenCalledWith(sortDirection.column, sortDirection.direction);
  })

  it('should report error', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
    const error = "Http failure response for https://api.github.com/search/users?q=login in:login: 400 Bad Request"
    const login = 'login'
    let url = `https://api.github.com/search/users?q=${login} in:login`
    service.search(login)
    httpMock.expectOne(url).flush({}, mockErrorResponse)
    expect(app.error).toEqual(error)

  })
});
