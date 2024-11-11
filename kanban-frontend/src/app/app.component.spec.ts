import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { GraphqlService } from './shared/graphql/graphql.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;

  beforeEach(async () => {
    graphqlServiceMock = jasmine.createSpyObj('GraphqlService', ['query']);
    graphqlServiceMock.query.and.returnValue(of({ data: {} }));
  
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        HomeComponent,
        AppComponent
      ],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header component', () => {
    const headerElement = fixture.nativeElement.querySelector('app-header');
    expect(headerElement).toBeTruthy();
  });

  it('should render the home component', () => {
    const homeElement = fixture.nativeElement.querySelector('app-home');
    expect(homeElement).toBeTruthy();
  });

  it('should have a router outlet', () => {
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
